FROM alpine
RUN apk add nodejs
WORKDIR /srv
ADD app.tar .
RUN echo "MinecraftClient is from https://github.com/ORelio/Minecraft-Console-Client, licensed under CDDL-1.0" > LICENSE-MinecraftClient
ADD publish MinecraftClient
USER 1000:1000
CMD node matrix-mcc-bot.js
