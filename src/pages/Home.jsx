import React from 'react'
import image1 from '../../images/photo1.webp'
import image2 from '../../images/photo2.jpg'


const Home = () => {
  return (
    <div className="container">
      <h1>Welcome to Peer Assessment site</h1>

      <div className="card mb-3" style={{ maxWidth: '80em' }}>
        <div className="row g-0">
          <div className="col-md-4">
            <img src={image1} className="img-fluid rounded-start" alt="Description" />
          </div>
          <div className="col-md-8">
            <div className="card-body">
              <h5 className="card-title"> Understanding the Importance of Peer Assessment </h5>
              <p className="card-text">
              Peer assessment plays a crucial role in enhancing the learning experience by encouraging students to evaluate each other's work. It fosters a collaborative environment where constructive feedback is shared, helping individuals identify their strengths and areas for improvement. This process not only builds critical thinking and analytical skills but also nurtures a sense of responsibility and accountability among peers.
              </p>
              {/* <p className="card-text">
                <small className="text-body-secondary">Last updated 3 mins ago</small>
              </p> */}
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-3" style={{ maxWidth: '80em' }}>
        <div className="row g-10">
          <div className="col-md-8 order-md-1">
            <div className="card-body">
              <h5 className="card-title">How it works</h5>
              <p className="card-text">
              Our web application provides an easy-to-use platform for conducting peer assessments. You can submit your work, review the submissions of your peers, and provide feedback using predefined criteria. This structured approach ensures that feedback is fair, constructive, and valuable, ultimately helping everyone to improve and grow together.
              </p>
              {/* <p className="card-text">
                <small className="text-body-secondary">Last updated 3 mins ago</small>
              </p> */}
            </div>
          </div>
          <div className="col-md-4 order-md-2">
            <img src={image2} className="img-fluid rounded-end" alt="Description" />
          </div>
        </div>
      </div>


    </div>

  )
}

export default Home