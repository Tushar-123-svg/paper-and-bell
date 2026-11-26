import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useEffect, useState } from "react";
const LINKS={user:[{to:"/market",label:"Dashboard",icon:"▦"},{to:"/market",label:"Markets",icon:"⌁"},{to:"/portfolio",label:"Portfolio",icon:"◫"},{to:"/leaderboard",label:"Leaderboard",icon:"♙"}],admin:[{to:"/admin",label:"Overview",icon:"▦"},{to:"/admin/activity",label:"Login Activity",icon:"◷"},{to:"/admin/users",label:"Traders",icon:"♙"}]};
export default function Navbar(){
  const {user,logout}=useAuth();
  const [dark,setDark]=useState(()=>localStorage.getItem("pb_theme")==="dark");
  const [compact,setCompact]=useState(()=>localStorage.getItem("pb_compact")==="true");
  useEffect(()=>{
    document.documentElement.dataset.theme=dark?"dark":"light";
    localStorage.setItem("pb_theme",dark?"dark":"light");
  },[dark]);
  useEffect(()=>{
    document.documentElement.dataset.compact=compact?"true":"false";
    localStorage.setItem("pb_compact",compact?"true":"false");
  },[compact]);
  useEffect(()=>{
    const handleShortcut=(e)=>{if(e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()==="d"){e.preventDefault();setDark(v=>!v)}if(e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()==="c"){e.preventDefault();setCompact(v=>!v)}};
    window.addEventListener("keydown",handleShortcut);
    return ()=>window.removeEventListener("keydown",handleShortcut);
  },[]);
  return <aside className="sidebar"><div className="brand"><span className="brand-mark">✦</span><span>Paper & Bell<span className="brand-sub">PAPER TRADING</span></span></div><div className="side-label">WORKSPACE</div><nav className="side-links">{LINKS[user.role].map(l=><NavLink key={l.to+l.label} to={l.to} className={({isActive})=>isActive?"side-link active":"side-link"}><span className="side-icon">{l.icon}</span>{l.label}</NavLink>)}</nav><div className="side-label side-label2">ACCOUNT</div><div className="side-account"><div className="avatar">{user.username?.slice(0,1).toUpperCase()}</div><div className="account-name">{user.username}<small>{user.role === "admin" ? "Administrator" : "Trader account"}</small></div><button className="logout" onClick={logout} title="Log out">↗</button></div><button className="theme-toggle" onClick={()=>setDark(v=>!v)} aria-label="Toggle dark mode" title="Toggle theme (Ctrl + Shift + D)"><span>{dark?"☀️":"🌙"}</span><span>{dark?"Light mode":"Dark mode"}</span><kbd>Ctrl ⇧ D</kbd></button><button className="theme-toggle" onClick={()=>setCompact(v=>!v)} title="Compact dashboard (Ctrl + Shift + C)"><span>▤</span><span>{compact?"Comfortable layout":"Compact layout"}</span><kbd>Ctrl ⇧ C</kbd></button><div className="sidebar-foot"><span className="live-dot"></span> Simulated market is live</div></aside>}
