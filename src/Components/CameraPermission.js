import '../Styles/global.css';
import '../Styles/camera.css';
import '../Styles/navbar.css';

export default function CameraPermission() {
  return (
    <div className="card center">
      <h2>Camera Access Required</h2>
      <p>
        We use your camera only to detect emotions in real-time.
        No images are stored.
      </p>
      <button onClick={() => navigator.mediaDevices.getUserMedia({ video: true })}>
        Enable Camera
      </button>
    </div>
  );
}
