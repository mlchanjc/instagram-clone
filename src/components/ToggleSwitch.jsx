export default function ToggleSwitch({ checked, onChange }) {
	return (
		<label className="relative inline-flex items-center cursor-pointer">
			<input type="checkbox" value="" className="sr-only peer" checked={checked} onChange={onChange} />
			<div className="text-xs group peer ring-0 bg-gray-300 rounded-full outline-none duration-150 after:duration-150 w-12 h-6 shadow-md peer-checked:bg-gray-800 peer-focus:outline-none after:rounded-full after:absolute after:bg-gray-50 after:outline-none after:h-5 after:w-5 after:top-0.5 after:left-0.5 after:-rotate-180 after:flex after:justify-center after:items-center peer-checked:after:translate-x-6 peer-hover:after:scale-95 peer-checked:after:rotate-0"></div>
		</label>
	);
}
