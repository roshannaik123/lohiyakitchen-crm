// import Cropper from "react-easy-crop";
// import { Modal, Slider } from "antd";
// import { useState, useCallback, useEffect } from "react";
// import getCroppedImg from "./cropImageUtils";

// const CropImageModal = ({
//   open,
//   imageSrc,
//   onCancel,
//   onCropComplete,
//   title = "Crop Image",
//   maxCropSize = { width: 300, height: 300 },
//   cropstucture = false,
// }) => {
//   const [zoom, setZoom] = useState(1);
//   const [crop, setCrop] = useState({ x: 0, y: 0 });
//   const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
//   const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

//   const onCropAreaComplete = useCallback((_, croppedPixels) => {
//     setCroppedAreaPixels(croppedPixels);
//   }, []);

//   useEffect(() => {
//     if (!imageSrc) return;
//     const img = new Image();
//     img.src = imageSrc;
//     img.onload = () => {
//       setImageSize({ width: img.width, height: img.height });
//     };
//   }, [imageSrc]);

//   const cropSize = {
//     width: Math.min(maxCropSize.width, imageSize.width),
//     height: Math.min(maxCropSize.height, imageSize.height),
//   };

//   const aspectRatio =
//     cropSize.width && cropSize.height
//       ? cropSize.width / cropSize.height
//       : 4 / 5;

//   const handleOk = async () => {
//     const croppedImage = await getCroppedImg(
//       imageSrc,
//       croppedAreaPixels,
//       cropSize,
//       cropstucture
//     );
//     onCropComplete(croppedImage);
//   };

//   return (
//     <Modal
//       open={open}
//       title={title}
//       onCancel={onCancel}
//       onOk={handleOk}
//       width={1000}
//       centered
//       maskClosable={false}
//       bodyStyle={{
//         padding: 0,
//         height: "75vh",
//         display: "flex",
//         flexDirection: "column",
//       }}
//     >
//       <div
//         style={{
//           flexGrow: 1,
//           position: "relative",
//           backgroundColor: "#000",
//           overflow: "hidden",
//           borderRadius: "4px",
//         }}
//       >
//         <Cropper
//           image={imageSrc}
//           crop={crop}
//           zoom={zoom}
//           aspect={aspectRatio}
//           cropSize={cropSize}
//           onCropChange={setCrop}
//           onZoomChange={setZoom}
//           onCropComplete={onCropAreaComplete}
//           style={{
//             containerStyle: {
//               width: "100%",
//               height: "100%",
//               position: "relative",
//               overflow: "hidden",
//             },
//             mediaStyle: {
//               objectFit: "contain", // ensures large images scale down
//               maxWidth: "100%",
//               maxHeight: "100%",
//             },
//           }}
//         />
//       </div>

//       <div style={{ padding: "16px 24px" }}>
//         <Slider
//           min={1}
//           max={3}
//           step={0.1}
//           value={zoom}
//           onChange={setZoom}
//         />
//       </div>
//     </Modal>
//   );
// };

// export default CropImageModal;
import Cropper from "react-easy-crop";
import { Modal, Slider } from "antd";
import { useState, useCallback, useEffect, useMemo } from "react";
import getCroppedImg from "./cropImageUtils";

const CropImageModal = ({
  open,
  imageSrc,
  onCancel,
  onCropComplete,
  title = "Crop Image",
  maxCropSize = { width: 300, height: 300 },
  cropstucture = false,
}) => {
  const [zoom, setZoom] = useState(1);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const onCropAreaComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });
    };
  }, [imageSrc]);

  const cropSize = useMemo(() => {
    if (!imageSize.width || !imageSize.height) return maxCropSize;

    const viewportHeight = window.innerHeight * 0.75; // 75vh (modal body height)
    const maxAvailableHeight = viewportHeight - 120; // account for modal padding and slider

    const adjustedWidth = maxCropSize.width;
    const adjustedHeight = maxCropSize.height;

    const scaleFactor = Math.min(
      imageSize.width / adjustedWidth,
      imageSize.height / adjustedHeight,
      maxAvailableHeight / adjustedHeight,
      1
    );

    return {
      width: adjustedWidth * scaleFactor,
      height: adjustedHeight * scaleFactor,
    };
  }, [imageSize, maxCropSize]);

  const aspectRatio =
    cropSize.width && cropSize.height
      ? cropSize.width / cropSize.height
      : 4 / 5;

  const handleOk = async () => {
    const croppedImage = await getCroppedImg(
      imageSrc,
      croppedAreaPixels,
      cropSize,
      cropstucture
    );
    onCropComplete(croppedImage);
  };
  return (
    <Modal
      open={open}
      title={title}
      onCancel={onCancel}
      onOk={handleOk}
      width={1000}
      centered
      maskClosable={false}
      styles={{
        body: {
          padding: 0,
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <div
        style={{
          flexGrow: 1,
          position: "relative",
          backgroundColor: "#000",
          overflow: "hidden",
          borderRadius: "4px",
        }}
      >
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio}
          cropSize={cropSize}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropAreaComplete}
          style={{
            containerStyle: {
              width: "100%",
              height: cropSize.height || 400,
              position: "relative",
              overflow: "hidden",
            },
            mediaStyle: {
              objectFit: "contain",
              maxWidth: "100%",
              maxHeight: "100%",
            },
          }}
        />
      </div>

      <div style={{ padding: "16px 24px" }}>
        <Slider min={1} max={3} step={0.1} value={zoom} onChange={setZoom} />
      </div>
    </Modal>
  );
};

export default CropImageModal;
