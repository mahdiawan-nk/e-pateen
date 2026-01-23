export default function Modal({ show, onClose, title, children }) {
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded p-6 w-full max-w-md">
                <h2 className="text-lg font-bold mb-4">{title}</h2>
                {children}
            </div>
        </div>
    );
}