FROM livekit/livekit-server:latest
ENTRYPOINT ["/bin/sh", "-c", "exec /livekit-server --bind 0.0.0.0 --port ${PORT:-7880} --keys \"$LIVEKIT_KEYS\""]
