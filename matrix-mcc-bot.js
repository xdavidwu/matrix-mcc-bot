const fs = require('fs');
const { spawn } = require('child_process');
const sdk = require('matrix-js-sdk');
const mcc = spawn('mono',
	['MinecraftClient.exe','mcc', '-' , process.env.MINECRAFT_SERVER,
		'BasicIO']);

var block = false;
var filters = [];

const client = sdk.createClient({
	baseUrl: process.env.MATRIX_BASEURL,
	accessToken: process.env.MATRIX_ACCESS_TOKEN,
	userId: process.env.MATRIX_USER
});
client.joinRoom(process.env.MATRIX_ROOM);

mcc.stdout.on('data', (data) => {
	str = data.toString('utf-8').replace(/§./g, '');
	console.log('mcc: ' + str);
	if (str.match(/^<.+>( @.+:.+)? msgon\n$/)) {
		block = false;
		mcc.stdin.write('bot: msg on\n');
		return;
	}
	if (str.match(/^<.+>( @.+:.+)? msgoff\n$/)) {
		block = true;
		mcc.stdin.write('bot: msg off\n');
		return;
	}
	if (str.match(/^<.+>( @.+:.+)? logfilters /)) {
		let subcmd = str.replace(/^<.+>( @.+:.+)? logfilters /, '').trimEnd();
		console.log('logfilters ' + subcmd);
		if (subcmd.match(/^list$/)) {
			let found = false;
			for (i in filters) {
				found = true;
				mcc.stdin.write(i + ': ' + filters[i] + '\n');
			}
			if (!found) {
				mcc.stdin.write('No filter regexes.\n');
			}
		} else if (subcmd.match(/^remove \d+$/)) {
			let idx = parseInt(subcmd.match(/^remove (\d+)$/)[1], 10);
			if (idx < filters.length) {
				filters.splice(idx, 1);
			} else {
				mcc.stdin.write('No such index.\n');
			}
		} else if (subcmd.match(/^add .+$/)){
			let exp = subcmd.match(/^add (.+)$/)[1];
			console.log('add ' + exp);
			try {
				new RegExp(exp);
			} catch(e) {
				mcc.stdin.write('Invalid regex.\n');
				return;
			}
			filters.push(exp);
		} else {
			mcc.stdin.write('Unrecognised subcommand\n');
		}
	}
	if (str.startsWith('mcc joined the game') || str.startsWith('mcc 來此共戲')) {
		mcc.stdin.write('/gamemode spectator\n');
	}
	if (!block) {
		let matched = false;
		for (i in filters) {
			if (str.match(filters[i])) {
				matched = true;
				break;
			}
		}
		if (!matched) {
			client.sendMessage(
				process.env.MATRIX_ROOM,
				{ "body": str, "msgtype": "m.text" }
			);
		}
	}
});

mcc.on('exit', (code, signal) => {
	console.log('mcc exited with code: ' + code + ' signal:' + signal);
	process.exit(code);
});

client.on('Room.timeline', (event, room, toStartOfTimeline, removed, data) => {
	if (event.getType() !== 'm.room.message' ||
			room.roomId !== process.env.MATRIX_ROOM ||
			!data.liveEvent ) {
		return;
	}
	const content = event.getContent().body;
	if (content.startsWith('.mcc /')) {
		if (content === '.mcc /list') {
			// use server /list
			// MCC /list is confusing and
			// cannot indicate server status
			mcc.stdin.write("/send /list\n");
		} else {
			console.log('receive command: ' + content);
			mcc.stdin.write(content.substring(5) + '\n');
		}
	} else if (content.startsWith('.mcc ')) {
		console.log('receive chat: ' + content);
		mcc.stdin.write(`${event.getSender()}: ${content.substring(5)}\n`);
	} else {
		return;
	}
	client.setRoomReadMarkers(room.roomId, event.getId(), event);
});

client.startClient();
