export async function getAudioDurationFromBlob(blob: Blob) {
  return new Promise((resolve, reject) => {
    const audioContext = new window.AudioContext();
    const reader = new FileReader();

    reader.onload = function () {
      const arrayBuffer = this.result;
      if (!arrayBuffer) {
        reject('No array buffer found');
        return;
      }
      audioContext.decodeAudioData(
        arrayBuffer as ArrayBuffer,
        (buffer) => {
          resolve(buffer.duration); // Duration in seconds
        },
        reject,
      );
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
}
