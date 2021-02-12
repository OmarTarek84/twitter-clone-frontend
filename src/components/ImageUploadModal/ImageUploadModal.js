import React, { useCallback, useEffect, useRef, useState } from "react";
import "./ImageUploadModal.scss";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const ImageUploadModal = ({ closeUploadModal, uploadProfilePic, photoType }) => {
  const [upImg, setUpImg] = useState();
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const [crop, setCrop] = useState({ unit: "%", width: 30, aspect: photoType === 'profilePic' ? 16 / 16: 16 / 9 });
  const [completedCrop, setCompletedCrop] = useState(null);

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => setUpImg(reader.result));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onLoad = useCallback((img) => {
    imgRef.current = img;
  }, []);

  const uploadProfilePicReq = () => {
    uploadProfilePic(previewCanvasRef.current.toDataURL(), photoType);
    closeUploadModal();
  };

  useEffect(() => {
    if (!completedCrop || !previewCanvasRef.current || !imgRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const crop = completedCrop;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext("2d");
    const pixelRatio = window.devicePixelRatio;

    canvas.width = crop.width * pixelRatio;
    canvas.height = crop.height * pixelRatio;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );
  }, [completedCrop]);

  

  return (
    <div className="backdrop">
      <div className="replyModal">
        <div className="titleP">
          <h2>Upload A new {photoType === 'profilePic' ? 'Profile Picture': 'Cover Photo'}</h2>
          <i className="fa fa-times" onClick={closeUploadModal}></i>
        </div>
        <div className="fileInput">
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={onSelectFile}
          />
          <canvas
            ref={previewCanvasRef}
            // Rounding is important so the canvas width and height matches/is a multiple for sharpness.
            style={{
              width: Math.round(completedCrop?.width ?? 0),
              height: Math.round(completedCrop?.height ?? 0),
            }}
          />
          <ReactCrop
            src={upImg}
            onImageLoaded={onLoad}
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
          />
        </div>
        <div className="btnActions">
          <button className="btn btn-primary upload" disabled={!crop || !previewCanvasRef.current} onClick={uploadProfilePicReq}>
            Upload
          </button>
          <button className="btn btn-danger" onClick={closeUploadModal}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadModal;
