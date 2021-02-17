FROM alpine:edge
RUN echo http://dl-cdn.alpinelinux.org/alpine/edge/testing >> /etc/apk/repositories
RUN apk add nodejs mono
WORKDIR /srv
ADD app.tar .
RUN echo "MinecraftClient.exe is from https://github.com/ORelio/Minecraft-Console-Client, licensed under CDDL-1.0" > LICENSE-MinecraftClient.exe
ADD MinecraftClient.exe .
USER 1000:1000
CMD node matrix-mcc-bot.js
