export default function Footer() {
    return (
        <footer className="mt-16 bg-white border-t border-slate-200 font-sans text-slate-700">
            <div className="max-w-[1240px] mx-auto px-4 lg:px-6 py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.3fr_1.3fr_1.2fr_2.4fr] gap-x-10 gap-y-10 items-start">
                    
                    <div>
                        <h4 className="font-bold text-slate-900 text-[16px] mb-3.5 tracking-tight">Marketplace</h4>
                        <ul className="space-y-2 text-[13px] text-slate-600">
                            <li><a href="#" className="hover:text-[#03ac0e] transition">Tentang Marketplace</a></li>
                            <li><a href="#" className="hover:text-[#03ac0e] transition">Hak Kekayaan Intelektual</a></li>
                            <li><a href="#" className="hover:text-[#03ac0e] transition">Karir</a></li>
                            <li><a href="#" className="hover:text-[#03ac0e] transition">Blog</a></li>
                            <li><a href="#" className="hover:text-[#03ac0e] transition">Marketplace Affiliate Program</a></li>
                            <li><a href="#" className="hover:text-[#03ac0e] transition">Marketplace B2B Digital</a></li>
                            <li><a href="#" className="hover:text-[#03ac0e] transition">Marketplace Marketing Solutions</a></li>
                            <li><a href="#" className="hover:text-[#03ac0e] transition">Kalkulator Indeks Masa Tubuh</a></li>
                            <li><a href="#" className="hover:text-[#03ac0e] transition">Marketplace Farma</a></li>
                            <li><a href="#" className="hover:text-[#03ac0e] transition">Promo Hari Ini</a></li>
                            <li><a href="#" className="hover:text-[#03ac0e] transition">Beli Lokal</a></li>
                            <li><a href="#" className="hover:text-[#03ac0e] transition">Promo Guncang</a></li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h4 className="font-bold text-slate-900 text-[16px] mb-3 tracking-tight">Beli</h4>
                            <ul className="space-y-2 text-[13px] text-slate-600">
                                <li><a href="#" className="hover:text-[#03ac0e] transition">Tagihan & Top Up</a></li>
                                <li><a href="#" className="hover:text-[#03ac0e] transition">Marketplace COD</a></li>
                                <li><a href="#" className="hover:text-[#03ac0e] transition">Bebas Ongkir</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-900 text-[16px] mb-3 tracking-tight">Jual</h4>
                            <ul className="space-y-2 text-[13px] text-slate-600">
                                <li><a href="#" className="hover:text-[#03ac0e] transition">Pusat Edukasi Seller</a></li>
                                <li><a href="#" className="hover:text-[#03ac0e] transition">Daftar Mall</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-900 text-[16px] mb-3 tracking-tight">Bantuan dan Panduan</h4>
                            <ul className="space-y-2 text-[13px] text-slate-600">
                                <li><a href="#" className="hover:text-[#03ac0e] transition">Marketplace Care</a></li>
                                <li><a href="#" className="hover:text-[#03ac0e] transition">Syarat dan Ketentuan</a></li>
                                <li><a href="#" className="hover:text-[#03ac0e] transition">Kebijakan Privasi</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="space-y-7">
                        <div>
                            <h4 className="font-bold text-slate-900 text-[16px] mb-3.5 tracking-tight">Keamanan & Privasi</h4>
                            <div className="flex flex-col gap-3">
                                <div className="w-[125px] h-[52px] rounded border border-[#d36e25] bg-[#3a3a3a] text-white flex flex-col items-center justify-center p-1 shadow-xs">
                                    <div className="flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-[11px] font-black text-amber-500 tracking-wider">PCI DSS</span>
                                    </div>
                                    <span className="text-[7.5px] font-bold text-slate-200 tracking-tight">COMPLIANT</span>
                                    <span className="text-[5.5px] text-amber-400/90 font-medium">ASSESSED BY CONTROLCASE</span>
                                </div>

                                <div className="w-[140px] h-[52px] border border-slate-300 rounded-lg p-2 flex items-center justify-between bg-white shadow-xs">
                                    <div className="flex flex-col items-center justify-center pr-2 border-r border-slate-200">
                                        <span className="text-[14px] font-black text-slate-900 leading-none">bsi.</span>
                                        <svg className="w-4 h-4 text-slate-800 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
                                            <path d="M9 12l2 2 4-4" />
                                        </svg>
                                    </div>
                                    <div className="text-[8px] leading-tight text-right font-semibold text-slate-700 pl-1.5">
                                        <p>ISO/IEC</p>
                                        <p>27001</p>
                                        <p className="text-[6.5px] text-slate-500 font-normal">Information Security Management</p>
                                    </div>
                                </div>

                                <div className="w-[140px] h-[52px] border border-slate-300 rounded-lg p-2 flex items-center justify-between bg-white shadow-xs">
                                    <div className="flex flex-col items-center justify-center pr-2 border-r border-slate-200">
                                        <span className="text-[14px] font-black text-slate-900 leading-none">bsi.</span>
                                        <svg className="w-4 h-4 text-slate-800 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
                                            <path d="M9 12l2 2 4-4" />
                                        </svg>
                                    </div>
                                    <div className="text-[8px] leading-tight text-right font-semibold text-slate-700 pl-1.5">
                                        <p>ISO/IEC</p>
                                        <p>27701</p>
                                        <p className="text-[6.5px] text-slate-500 font-normal">Privacy Information Management</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-900 text-[16px] mb-3 tracking-tight">Ikuti Kami</h4>
                            <div className="flex items-center gap-2.5">
                                <a href="#" aria-label="Facebook" className="w-8 h-8 rounded-full bg-[#3b5998] flex items-center justify-center text-white text-sm font-bold hover:opacity-90 transition shadow-xs">f</a>
                                <a href="#" aria-label="Twitter X" className="w-8 h-8 rounded-full bg-[#00acee] flex items-center justify-center text-white text-sm font-bold hover:opacity-90 transition shadow-xs">𝕏</a>
                                <a href="#" aria-label="Pinterest" className="w-8 h-8 rounded-full bg-[#cb2027] flex items-center justify-center text-white text-sm font-bold hover:opacity-90 transition shadow-xs">p</a>
                                <a href="#" aria-label="Instagram" className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold hover:opacity-90 transition shadow-xs">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 text-[16px] mb-3.5 tracking-tight leading-snug">
                            Nikmatin keuntungan spesial di aplikasi:
                        </h4>

                        <ul className="space-y-3 text-[14px] text-slate-800 font-medium mb-5">
                            <li className="flex items-center gap-2.5">
                                <svg className="w-5 h-5 text-[#03ac0e] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 12v-2m0 0c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Diskon 70%* hanya di aplikasi</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <svg className="w-5 h-5 text-[#03ac0e] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                <span>Promo khusus aplikasi</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <svg className="w-5 h-5 text-[#03ac0e] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8h4.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h2" />
                                </svg>
                                <span>Gratis Ongkir tiap hari</span>
                            </li>
                        </ul>

                        <div className="space-y-3">
                            <p className="text-[13px] text-slate-500">Buka aplikasi dengan scan QR atau klik tombol:</p>
                            
                            <div className="flex items-center gap-3.5">
                                <div className="w-[135px] h-[135px] border border-slate-300 rounded-xl p-1.5 bg-white shrink-0 shadow-xs">
                                    <img
                                        src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://www.tokopedia.com/download-app"
                                        alt="QR Code Marketplace"
                                        width={130}
                                        height={130}
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full h-full object-contain"
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                                        alt="Google Play"
                                        width={135}
                                        height={40}
                                        loading="lazy"
                                        decoding="async"
                                        className="h-10 w-auto cursor-pointer object-contain self-start hover:opacity-90 transition"
                                    />
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                                        alt="App Store"
                                        width={135}
                                        height={40}
                                        loading="lazy"
                                        decoding="async"
                                        className="h-10 w-auto cursor-pointer object-contain self-start hover:opacity-90 transition"
                                    />
                                    <div className="h-10 bg-black rounded-lg flex items-center gap-2 px-3 cursor-pointer w-[135px] hover:opacity-90 transition shadow-xs">
                                        <div className="w-5 h-5 rounded-full bg-[#c7000b] flex items-center justify-center shrink-0">
                                            <div className="w-2.5 h-2.5 rounded-full bg-white opacity-90" />
                                        </div>
                                        <div className="text-white text-left leading-tight">
                                            <p className="text-[7.5px] uppercase tracking-wider text-slate-300">Explore it on</p>
                                            <p className="text-[11px] font-bold tracking-tight">AppGallery</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <a href="#" className="inline-block text-[#03ac0e] font-bold text-[14px] hover:underline pt-2">
                                Pelajari Selengkapnya &rarr;
                            </a>
                        </div>
                    </div>

                </div>
            </div>

            <div className="border-t border-slate-200 py-5 bg-white">
                <div className="max-w-[1240px] mx-auto px-4 lg:px-6 text-[13px] text-slate-500">
                    <p>© 2009 - 2026, PT. Marketplace. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
}