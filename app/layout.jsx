import localFont from 'next/font/local';
import './globals.scss';
const font=localFont({src:'./fonts/Manrope.woff2',display:'swap',variable:'--font-body',weight:'200 800'});
const origin='https://adil-orbit-light.pages.dev';
export const metadata={metadataBase:new URL(origin),title:'ORBIT — свет вне привычной геометрии',description:'Пространственная экспозиция Three.js. Три главы, живая геометрия, смена ракурсов и интерактивный свет.',alternates:{canonical:'/'},robots:{index:false,follow:false},openGraph:{type:'website',locale:'ru_RU',url:origin,title:'ORBIT — свет в движении',description:'Три орбиты. Один центр. Интерактивное исследование света.',images:[{url:'/og.png',width:1200,height:630}]},twitter:{card:'summary_large_image',images:['/og.png']}};
export const viewport={themeColor:'#0d0d13',colorScheme:'dark'};
export default function Layout({children}){return <html lang="ru" className={font.variable}><body><a className="skip" href="#main">К содержимому</a>{children}</body></html>}
