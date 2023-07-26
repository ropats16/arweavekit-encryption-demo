"use client";

import {
  encryptFileWithAES,
  encryptAESKeywithRSA,
  decryptFileWithAES,
  decryptAESKeywithRSA,
} from "arweavekit/encryption";
import { useState } from "react";

function fileToArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(reader.error);
    };

    reader.readAsArrayBuffer(file);
  });
}

function arrayBufferToFile(arrayBuffer) {
  const blob = new Blob([arrayBuffer], { type: "image/png" });
  return new File([blob], "Arweave Kit");
}

export default function Home() {
  const [inputFile, setInputFile] = useState();
  const [encryptedData, setEncryptedData] = useState();
  const [encryptedKey, setEncryptedKey] = useState();
  const [imageUrl, setImageUrl] = useState(null);

  const handleEncryption = async (e) => {
    e.preventDefault();

    // const fileAsArrayBuffer = await fileToArrayBuffer(inputFile);
    // console.log(
    //   "This is the type of fileAsArrayBuffer",
    //   typeof inputFile,
    //   "This is the file",
    //   fileAsArrayBuffer
    // );
    const encryptedDataFromFunction = await encryptFileWithAES({
      data: inputFile,
    });

    const keyFromRSA = await encryptAESKeywithRSA({
      key: encryptedDataFromFunction.rawEncryptedKeyAsBase64,
    });

    setEncryptedData(encryptedDataFromFunction.combinedArrayBuffer);
    setEncryptedKey(keyFromRSA);

    // console.log(
    //   "This is the encrypted data:",
    //   encryptedDataFromFunction.combinedArrayBuffer
    // );
    // console.log("This is the encrypted key:", keyFromRSA);
  };

  const handleDecryption = async () => {
    console.log(
      "This is the encrypted key in the decrypt function:",
      encryptedKey
    );
    console.log(
      "This is the encrypted data in the decrypt function:",
      encryptedData
    );
    const decryptedKey = await decryptAESKeywithRSA({
      key: encryptedKey,
    });

    // console.log("This is the decrypted key:", decryptedKey);

    const decryptedData = await decryptFileWithAES({
      data: encryptedData,
      key: decryptedKey,
    });

    // console.log(
    //   "This is the decrypted data:",
    //   arrayBufferToFile(decryptedData)
    // );
    const blob = new Blob([decryptedData], { type: "image/png" });
    const url = URL.createObjectURL(blob);
    setImageUrl(url);
  };

  console.log("Selected File", inputFile);
  return (
    <div>
      <h1>File Upload</h1>
      <form>
        <input
          type="file"
          onChange={async (e) =>
            setInputFile(await fileToArrayBuffer(e.target.files[0]))
          }
        />
        <button type="submit" onClick={(e) => handleEncryption(e)}>
          Submit
        </button>
      </form>
      <img src={imageUrl} alt="Decrypted" />
      <button onClick={handleDecryption}>Decrypt</button>
    </div>
  );
}
