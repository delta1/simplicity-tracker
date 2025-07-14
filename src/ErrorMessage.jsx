function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <div style={{ color: '#fff', background: '#c00', padding: '1em', borderRadius: '4px', margin: '1em 0' }}>
      <strong>Error:</strong> {message}
    </div>
  );
}

export default ErrorMessage;
