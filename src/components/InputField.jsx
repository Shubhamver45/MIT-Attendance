import React, { useState } from 'react';
import { EyeIcon } from './Icons';

export const InputField = ({ id, label, type, placeholder, icon, value, onChange, autoFocus }) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    return (
        <div className="animate-fadeIn">
            <label htmlFor={id} className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] block mb-2 ml-1">{label}</label>
            <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-300 group-focus-within:text-[#4B1D6F] transition-colors">{icon}</span>
                <input
                    id={id} 
                    name={id} 
                    autoFocus={autoFocus}
                    type={isPasswordVisible ? 'text' : type}
                    placeholder={placeholder} 
                    value={value} 
                    onChange={onChange}
                    required 
                    className={`input-field-professional ${icon ? '!pl-12' : ''}`}
                />
                {type === 'password' && (
                    <button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)} className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-300 hover:text-[#4B1D6F] transition-all">
                        <EyeIcon className="w-5 h-5"/>
                    </button>
                )}
            </div>
        </div>
    );
};