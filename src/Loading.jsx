const Loading = ({ size = 48, show = false }) => {
  const visibility = show ? "visible" : "hidden";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 50 50"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "inline-block", visibility, verticalAlign: "bottom" }}
    >
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke="#EA9606"
        strokeWidth="5"
        strokeDasharray="31.4 31.4"
        strokeLinecap="round"
        transform="rotate(-90 25 25)"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 25 25"
          to="360 25 25"
          dur="1s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
};

export default Loading;
