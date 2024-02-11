import { MdClose } from "react-icons/md";
import { useEffect } from "react";

const BottomModal = ({ children, onClick }) => {
	useEffect(() => {
		document.body.style.overflow = "hidden";

		return () => {
			document.body.style.overflow = null;
		};
	}, []);

	return (
		<>
			<div className="fixed inset-0 z-[300] bg-black bg-opacity-50 overflow-hidden" onClick={onClick}>
				<div className="justify-center items-center flex overflow-auto fixed inset-0 z-[300] animate-zoomOut">
					<div onClick={(e) => e.stopPropagation()} className="justify-center items-center flex overflow-auto">
						{children}
					</div>
				</div>
			</div>
			<button className="fixed top-5 right-5 z-[300] active:opacity-50" onClick={onClick}>
				<MdClose size={30} color="white" />
			</button>
		</>
	);
};

export default BottomModal;
