const { spawn } = require("node:child_process");
const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json());
// Change this accordingly to our needs later on
app.use(cors({ origin: "*" }));

app.post("/voice", (req, res) => {
  // Receive text to be TTS'ed
  const text = req.body?.text;
  console.log(text);
  // If text is absent, send bad request status
  if (!text) res.sendStatus(400);

  // Create subprocess to TTS text into audio using piper with streaming audio

  // This is the command we're looking to reproduce, it uses a pipe, so we need two processes, because there are two things happening

  /*
  echo 'This sentence is spoken first. This sentence is synthesized while the first sentence is spoken.' | \
  piper --model en_US-lessac-medium.onnx --output-raw | \
  aplay -r 22050 -f S16_LE -t raw -
  */

  // 1st we output a string and then that string is piped into the next command
  // 2nd the string is piped into piper and then piper streams the raw audio
  // Note that the stream is not .wav, but 16-bit mono PCM samples

  const echo = spawn("echo", [text]);

  const piper = spawn("piper", [
    "--model",
    "pt_BR-faber-medium",
    "--output-raw",
  ]);

  // Upon data being streamed to stdout in echo
  echo.stdout.on("data", (data) => {
    // Piper process will write it, basically what | would do
    piper.stdin.write(data);
  });

  // Upon echo closing (exiting)
  echo.on("close", () => {
    // Piper stops writing in the writable stream, ending it
    // Now piper is ready to process and then ouput
    piper.stdin.end();
  });

  // Upon piper process outputting data in the readable stream
  piper.stdout.on("data", (data) => {
    // We log it, for debugging purposes
    console.log(data);
  });

  // Upon receiving raw audio chunks into stdout, we stream it into response
  piper.stdout.pipe(res);
});

// Spinning up server
app.listen(5006);
