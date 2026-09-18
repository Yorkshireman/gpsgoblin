const loadBrotli = async () => {
  return (await import('brotli-wasm')).default;
};

export const compressBrotli = async (contents: ArrayBuffer) => {
  const brotli = await loadBrotli();
  return brotli.compress(new Uint8Array(contents), { quality: 10 });
};

export const decompressBrotli = async (
  contents: ArrayBuffer,
  limit: number,
  limitMessage: string
) => {
  const brotli = await loadBrotli();
  const chunks: Uint8Array[] = [];
  const input = new Uint8Array(contents);
  const stream = new brotli.DecompressStream();
  let offset = 0;
  let size = 0;

  try {
    while (true) {
      const result = stream.decompress(input.subarray(offset), 65_536);
      let code: number;

      try {
        const chunk = result.buf;
        code = result.code;
        offset += result.input_offset;
        size += chunk.byteLength;

        if (size > limit) throw new Error(limitMessage);

        chunks.push(chunk);
      } finally {
        result.free();
      }

      if (code === brotli.BrotliStreamResultCode.ResultSuccess) {
        if (offset !== input.byteLength) throw new Error('Trailing data');
        break;
      }

      if (code !== brotli.BrotliStreamResultCode.NeedsMoreOutput) {
        throw new Error('Incomplete Brotli data');
      }
    }
  } finally {
    stream.free();
  }

  const output = new Uint8Array(size);
  offset = 0;

  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return output.buffer;
};
