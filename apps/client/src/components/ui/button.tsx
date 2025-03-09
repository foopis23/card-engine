
export function Button(props: {
  children?: React.ReactNode;
  onClick?: () => void;
}) {
  const {
    children, onClick
  } = props;
  return (
    <button onClick={onClick} className="block bg-zinc-950 px-8 py-2 text-white rounded hover:cursor-pointer">
      {children}
    </button>
  );
}
