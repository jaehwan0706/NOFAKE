import { useParams } from "react-router-dom";
import QRScanCard from "../components/QRScanCard";
import { startCameraScan, uploadQRImage } from "../services/qrScanner";
import mockEvents from "../data/mockEvents";

export default function Participate() {
  const { slug } = useParams();

  const event = mockEvents.find((item) => item.slug === slug);

  if (!event) {
    return (
      <div className="participate-page">
        <div className="page-heading">
          <h2>이벤트를 찾을 수 없습니다</h2>
          <p>존재하지 않거나 삭제된 이벤트입니다.</p>
        </div>
      </div>
    );
  }

  const handleCameraScan = () => {
    startCameraScan();
  };

  const handleImageUpload = () => {
    uploadQRImage();
  };

  return (
    <div className="participate-page">
      <div className="participate-header">
        <h1>{event.title}</h1>
        <p>{event.qrTitle}</p>
      </div>

      <div className="participate-grid">
        <QRScanCard
          onCameraScan={handleCameraScan}
          onImageUpload={handleImageUpload}
        />

        <div className="participate-right-column">
          <div className="participate-card mint-card">
            <div className="participate-card-header">
              <h3>미스터리 박스 민팅</h3>
            </div>

            <div className="mint-card-body">
              <div className="mint-placeholder">BOX</div>

              <p className="mint-card-title">{event.mintTitle}</p>
              <p className="mint-card-desc">{event.mintDescription}</p>

              <div className="mint-cost-box">
                <div>
                  <span>민팅 비용</span>
                  <strong>{event.mintPrice}</strong>
                </div>
                <div>
                  <span>가스비 예상</span>
                  <strong>{event.gasEstimate}</strong>
                </div>
                <div>
                  <span>총 비용</span>
                  <strong>{event.totalCost}</strong>
                </div>
              </div>

              <button type="button" className="mint-disabled-btn">
                QR 스캔 후 민팅 가능
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="participate-guide-card">
        <h3>참여 안내</h3>
        <ul>
          <li>{event.qrDescription}</li>
          <li>미스터리 박스를 민팅하면 이벤트 참여가 완료됩니다.</li>
          <li>당첨 결과는 내 지갑 또는 이벤트 개요에서 확인할 수 있습니다.</li>
          <li>모든 추첨 과정은 투명성 센터에서 검증 가능합니다.</li>
        </ul>
      </div>
    </div>
  );
}