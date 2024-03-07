export default function Loader({show}) {
  if (!show) {
    return <></>
  } else {
    return <div className="loader-container">
      <div className="loader"></div>
    </div>
  }
}