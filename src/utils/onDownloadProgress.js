import { useProgress } from "@/components/ProgressBar";

// put this in axios option if need to display progress bar while fetching data

export default function onDownloadProgress(progressEvent) {
	if (progressEvent.progress) {
		const { setProgress } = useProgress();
		setProgress(progressEvent.progress);
	}
}
