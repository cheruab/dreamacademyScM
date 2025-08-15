import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminUploadResult = () => {
  const [parents, setParents] = useState([]);
  const [selectedParent, setSelectedParent] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get(`/api/results/${parentId}`)
// Make sure you have an endpoint to get all parents
      .then(res => setParents(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedParent || !file) {
      setMessage("Please select a parent and choose a file.");
      return;
    }

    const formData = new FormData();
    formData.append("resultFile", file);

    try {
      await axios.post(`/api/admin/uploadResult/${selectedParent}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setMessage("Result uploaded successfully!");
      setFile(null);
      setSelectedParent("");
    } catch (err) {
      setMessage("Error uploading result.");
    }
  };

  return (
    <div>
      <h2>Upload Result for Parent</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <select value={selectedParent} onChange={(e) => setSelectedParent(e.target.value)}>
          <option value="">Select Parent</option>
          {parents.map(parent => (
            <option key={parent._id} value={parent._id}>
              {parent.name} - {parent.email}
            </option>
          ))}
        </select>

        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default AdminUploadResult;
