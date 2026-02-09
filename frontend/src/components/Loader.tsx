import './Loader.css'

const Loader = () => {
  return (
    <div className="image-gen-container">
      <div className="image-gen-inner">
        <div className="image-gen-spinner">
          <div className="image-gen-circle" />
          <div className="image-gen-circle" />
          <div className="image-gen-circle" />
          <div className="image-gen-circle" />
        </div>
      </div>
    </div>
  )
}

export default Loader