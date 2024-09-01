import QRCode from "qrcode";

export const generateQRCode = async (data: QRCode.QRCodeSegment[]) => {
  const qr = await QRCode.toDataURL(...[JSON.stringify(data)], {
    errorCorrectionLevel: "H",
  });

  return qr;
};
