FROM livekit/livekit-server:latest
# Render's web service builder needs a Dockerfile in the repo (it can't pull a
# prebuilt image from a registry directly) — this one just re-packages the
# official LiveKit image so Render can build and run it.
ENTRYPOINT ["/livekit-server"]
