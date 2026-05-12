import React, { useState } from 'react';
import { MapPinIcon, CheckIcon } from './Icons.jsx';
import { getCurrentLocation } from '../utils/geolocation.js';

// Supports both prop naming conventions:
// Old: { location, radius, onLocationChange, onRadiusChange }
// Smart-attendance: { onLocationSelect, currentRadius, onRadiusChange }
export const LocationPicker = ({ location, radius, onLocationChange, onRadiusChange, onLocationSelect, currentRadius }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [locationStatus, setLocationStatus] = useState('');
    const [internalLocation, setInternalLocation] = useState({ latitude: null, longitude: null });

    // Resolve props from either naming convention
    const resolvedLocation = location || internalLocation;
    const resolvedRadius = radius ?? currentRadius ?? 100;

    const handleLocationUpdate = (loc) => {
        setInternalLocation(loc);
        if (onLocationChange) onLocationChange(loc);
        if (onLocationSelect) onLocationSelect(loc);
    };

    const handleGetCurrentLocation = async () => {
        setIsLoading(true);
        setError('');
        setLocationStatus('');
        try {
            const position = await getCurrentLocation();
            handleLocationUpdate({
                latitude: position.latitude,
                longitude: position.longitude,
                accuracy: position.accuracy
            });
            const displayAcc = Math.round(position.accuracy);
            if (displayAcc > 30) {
                const recommendedRadius = Math.max(resolvedRadius, displayAcc + 20);
                if (onRadiusChange) onRadiusChange(recommendedRadius);
                setLocationStatus(`⚠️ Laptop GPS inaccurate (±${displayAcc}m). Auto-increased radius to ${recommendedRadius}m.`);
            } else {
                setLocationStatus(`✅ Location secured! (Accuracy: ±${displayAcc}m)`);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const lat = resolvedLocation?.latitude;
    const lng = resolvedLocation?.longitude;

    return (
        <div className="space-y-5">
            {/* Location Status Card */}
            {lat && lng ? (
                <div className="bg-green-50 border-2 border-green-200 p-5 rounded-[20px] flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                        <CheckIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-green-800 uppercase tracking-widest">📍 Location Set</p>
                        <p className="text-xs text-green-700 mt-1 font-mono">
                            {lat.toFixed(6)}, {lng.toFixed(6)}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-amber-50 border-2 border-dashed border-amber-300 p-5 rounded-[20px] text-center">
                    <MapPinIcon className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <p className="text-sm font-black text-amber-800 uppercase tracking-widest">No Location Set</p>
                    <p className="text-xs text-amber-600 mt-1">Click below to set your classroom coordinates</p>
                </div>
            )}

            {/* Get Location Button */}
            <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isLoading}
                className="w-full bg-[#4B1D6F] text-white font-black py-4 px-6 rounded-[16px] hover:bg-[#3a1656] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all hover:shadow-xl hover:shadow-[#4B1D6F]/20 text-xs uppercase tracking-widest"
            >
                {isLoading ? (
                    <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Calibrating GPS...
                    </>
                ) : (
                    <>
                        <MapPinIcon className="w-4 h-4" />
                        {lat ? 'Update Location' : 'Set Current Location'}
                    </>
                )}
            </button>

            {/* Status / Error Messages */}
            {locationStatus && (
                <div className={`p-4 rounded-[16px] text-xs font-bold uppercase tracking-widest border-2 ${
                    locationStatus.includes('⚠️')
                        ? 'bg-amber-50 border-amber-200 text-amber-800'
                        : 'bg-green-50 border-green-200 text-green-700'
                }`}>
                    {locationStatus}
                </div>
            )}
            {error && (
                <div className="bg-red-50 border-2 border-red-200 p-4 rounded-[16px] text-xs font-bold text-red-700 uppercase tracking-widest">
                    ✗ {error}
                </div>
            )}

            {/* Radius Slider */}
            <div className="bg-slate-50 p-5 rounded-[20px] border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                    <label className="text-xs font-black text-slate-600 uppercase tracking-widest">Geofence Radius</label>
                    <span className="text-lg font-black text-[#4B1D6F]">{resolvedRadius}m</span>
                </div>
                <input
                    type="range"
                    min="10"
                    max="2000"
                    step="10"
                    value={resolvedRadius}
                    onChange={(e) => onRadiusChange && onRadiusChange(parseInt(e.target.value))}
                    className="w-full accent-[#4B1D6F] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
                    <span>10m</span>
                    <span>Classroom</span>
                    <span>Campus</span>
                    <span>2km</span>
                </div>
                <div className="mt-3 bg-white rounded-xl p-3 border border-slate-100 text-center">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                        Students must be within <span className="text-[#F39200]">{resolvedRadius}m</span> to mark attendance
                    </p>
                </div>
            </div>
        </div>
    );
};
