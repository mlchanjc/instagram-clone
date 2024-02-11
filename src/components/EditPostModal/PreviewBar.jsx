import { DndContext, closestCenter, MouseSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import { useEffect, useState, useRef, useContext } from "react";
import PreviewBarImage from "./PreviewBarImage";
import { GoPlusCircle } from "react-icons/go";
import { PhotoContext } from "../../contexts/PostInfoContexts";

const PreviewBar = () => {
	const { photos, setPhotos, currentPhoto, setCurrentPhoto, setTags } = useContext(PhotoContext);
	const fileInputRef = useRef(null);

	const [ids, setIds] = useState(
		[...Array(photos.length)].map((_, index) => {
			return index + 1;
		})
	); //start with 1 because id cannot be 0

	useEffect(() => {
		setIds(
			[...Array(photos.length)].map((_, index) => {
				return index + 1;
			})
		);
	}, [photos]);

	const mouseSensor = useSensor(MouseSensor, {
		activationConstraint: {
			distance: 2,
		},
	});
	const sensors = useSensors(mouseSensor); //only activate swapping when mouse moved at least 2px, to enable click on swappable

	const handleDragEnd = (e) => {
		const { active, over } = e;

		if (active && over) {
			if (active.id !== over.id) {
				setPhotos((prev) => {
					return arrayMove(prev, active.id - 1, over.id - 1);
				});
				setTags((prev) => {
					return arrayMove(prev, active.id - 1, over.id - 1);
				});
			}
			setCurrentPhoto(over.id - 1);
		}
	}; //handle swapping of photos order

	const deletePhoto = (index) => {
		let temp = [...photos];
		temp.splice(index, 1);
		if (currentPhoto >= temp.length - 1) setCurrentPhoto(Math.max(0, temp.length - 1));
		setPhotos(temp);
		setTags((prev) => {
			let temp = [...prev];
			temp.splice(index, 1);
			return temp;
		});
	};

	const handleFileSelect = async (event) => {
		const selectedFiles = event.target.files;

		for (let i = 0; i < selectedFiles.length; i++) {
			const file = selectedFiles.item(i);
			if (file.size > 20 * 1024 * 1024) {
				window.alert("Some photos are too large (Max 20MB)");
				return;
			}
		}

		if (selectedFiles.length + photos.length > 10) {
			window.alert("You cannot upload more than 10 photos");
			return;
		}

		let temp = [];

		const func = (file) => {
			return new Promise((resolve, reject) => {
				const reader = new FileReader();

				reader.onload = function () {
					temp = [...temp, reader.result];
					resolve();
				};

				reader.onerror = function (error) {
					reject(error);
				};

				reader.readAsDataURL(file);
			});
		};

		for (let i = 0; i < selectedFiles.length; i++) {
			await func(selectedFiles[i]);
		}
		setPhotos((prev) => [...prev, ...temp]);
		setTags((prev) => {
			const newArray = Array.from({ length: temp.length }, () => []);
			return [...prev, ...newArray];
		});
	};

	return (
		<>
			<DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToHorizontalAxis]} sensors={sensors}>
				<div className="relative flex h-24 space-x-2 overflow-auto custom-scrollbar p-1">
					<SortableContext items={ids} strategy={horizontalListSortingStrategy}>
						{ids.map((id) => (
							<PreviewBarImage key={`PreviewBarImage${id}`} id={id} photo={photos[id - 1]} deletePhoto={deletePhoto} />
						))}
					</SortableContext>
				</div>
			</DndContext>
			{photos.length < 10 && (
				<button onClick={() => fileInputRef.current?.click()}>
					<GoPlusCircle color="white" size={30} />
					<input accept="image/jpeg, .png" type="file" multiple onChange={handleFileSelect} ref={fileInputRef} style={{ display: "none" }} />
				</button>
			)}
		</>
	);
};

export default PreviewBar;
