const UpdateWaiting = ({ updateWaiting, handleUpdate }) => {
  if (!updateWaiting) return <></>;
  return (
    <div>
      Update waiting! <button onClick={handleUpdate}>Update</button>
    </div>
  );
};

export default UpdateWaiting;
