import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "./App.css";

const App = () => {
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentDetails, setStudentDetails] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [username, setUsername] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isUserVerified, setIsUserVerified] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:3000/subjects')
      .then(response => setSubjects(response.data))
      .catch(error => console.error('Error fetching subjects:', error));

    axios.get('http://localhost:3000/students')
      .then(response => setStudents(response.data))
      .catch(error => console.error('Error fetching students:', error));

    axios.get('http://localhost:3000/studentDetail')
      .then(response => setStudentDetails(response.data[0]))
      .catch(error => console.error('Error fetching student details:', error));
  }, []);

  const handleSubjectSelect = (e) => {
    const selectedId = e.target.value;
    setSelectedSubject(selectedId);

    if (selectedId) {
      const newRequest = {
        subjectId: selectedId,
        username: username,
        dateRequested: new Date().toISOString(),
      };

      axios.post('http://localhost:3000/requests', newRequest)
        .then(response => {
          console.log('Request sent:', response.data);
          alert('Request sent!');
        })
        .catch(error => console.error('Error sending request:', error));

      navigate('/form'); 
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newUser = {
      name: username,
      email: userEmail,
    };

    localStorage.setItem('user', JSON.stringify(newUser));

    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser && storedUser.name === username) {
      setIsUserVerified(true);
    }

    axios.post('http://localhost:3000/users', newUser)
      .then(response => {
        console.log('User added:', response.data);
      })
      .catch(error => console.error('Error adding user:', error));
  };

  const handleStudentClick = (studentName) => {
    const selectedDetail = studentDetails.find(detail => detail.studentName === studentName);
  
    if (selectedDetail) {
      const request = {
        email: selectedDetail.email,
        dateRequested: new Date().toISOString(),
      };
  
      axios.post('http://localhost:3000/detailRequests', request)
        .then(() => {
          alert('Student email and date requested added to detailRequests!');
          setSelectedStudent(selectedDetail);
          setShowModal(true);
        })
        .catch(error => console.error('Error adding to detailRequests:', error));
    }
  };
  

  const closeModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
  };

  const selectedSubjectTitle = subjects.find(subject => subject.id === selectedSubject)?.title;

  const filteredStudents = students.filter(student => student.title === selectedSubjectTitle);

  return (
    <div>
      <h1>React and JSON Server Example</h1>

      <label htmlFor="subject">Select Subject: </label>
      <select
        id="subject"
        value={selectedSubject}
        onChange={handleSubjectSelect}
      >
        <option value="">--Select Subject--</option>
        {subjects.map((subject) => (
          <option key={subject.id} value={subject.id}>
            {subject.title}
          </option>
        ))}
      </select>

      {selectedSubject && !isUserVerified && (
        <div className='formSection'>
          <h2>Enter Your Details</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username">Username: </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="useremail">Email: </label>
              <input
                type="email"
                id="useremail"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit">Submit</button>
          </form>
        </div>
      )}

      {isUserVerified && selectedSubject && (
        <div>
          <h2>Student Records</h2>
          {filteredStudents.length > 0 ? (
            <table border="1">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Student Name</th>
                  <th>Marks</th>
                  <th>Percentage</th>
                  <th>HOD</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>{student.title}</td>
                    <td onClick={() => handleStudentClick(student.studentName)} style={{ cursor: 'pointer', color: 'blue' }}>
                      {student.studentName}
                    </td>
                    <td>{student.marks}</td>
                    <td>{student.percentage}</td>
                    <td>{student.HOD}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No Records found.</p>
          )}
        </div>
      )}

      {showModal && selectedStudent && (
        <div className="modal">
          <div className="modal-content">
            <h2>Student Details</h2>
            <p><strong>Name:</strong> {selectedStudent.studentName}</p>
            <p><strong>Email:</strong> {selectedStudent.email}</p>
            <p><strong>Phone:</strong> {selectedStudent.phone}</p>
            <p><strong>City:</strong> {selectedStudent.city}</p>
            <p><strong>Section:</strong> {selectedStudent.section}</p>
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
