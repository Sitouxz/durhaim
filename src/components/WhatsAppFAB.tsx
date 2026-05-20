export default function WhatsAppFAB() {
  const waMessage = encodeURIComponent('Halo, saya ingin bertanya tentang produk Durhaim.');
  const waUrl = `https://wa.me/6282120101473?text=${waMessage}`;

  return (
    <a
      className="fixed bottom-margin-edge right-margin-edge w-14 h-14 bg-operator-green border-2 border-stark-white rounded-full flex items-center justify-center shadow-lg hover:bg-signal-orange hover:border-tactical-black transition-all duration-300 z-50 group"
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="material-symbols-outlined text-stark-white group-hover:text-tactical-black">chat</span>
    </a>
  );
}
