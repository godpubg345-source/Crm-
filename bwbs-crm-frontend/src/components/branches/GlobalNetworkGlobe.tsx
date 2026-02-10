import { useRef, useEffect, useState } from 'react';
import Globe from 'react-globe.gl';
import { type Branch } from '../../services/branches';

interface GlobalNetworkGlobeProps {
    branches: Branch[];
}

const GlobalNetworkGlobe = ({ branches }: GlobalNetworkGlobeProps) => {
    const globeEl = useRef<any>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const updateDimensions = () => {
            const parent = document.getElementById('globe-container');
            if (parent) {
                setDimensions({
                    width: parent.clientWidth,
                    height: parent.clientHeight
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);

        // Auto-rotate
        if (globeEl.current) {
            globeEl.current.controls().autoRotate = true;
            globeEl.current.controls().autoRotateSpeed = 0.5;
            globeEl.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 });
        }

        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Filter branches with coordinates
    const locations = branches
        .filter(b => b.latitude && b.longitude)
        .map(b => ({
            lat: Number(b.latitude),
            lng: Number(b.longitude),
            size: b.is_hq ? 0.3 : 0.1,
            color: b.is_hq ? '#AD03DE' : '#6366f1',
            label: b.name
        }));

    return (
        <div id="globe-container" className="w-full h-full relative overflow-hidden rounded-[3rem] bg-slate-900 shadow-2xl">
            <Globe
                ref={globeEl}
                width={dimensions.width}
                height={dimensions.height}
                backgroundColor="rgba(0,0,0,0)"
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                pointsData={locations}
                pointRadius="size"
                pointColor="color"
                pointAltitude={0.01}
                labelsData={locations}
                labelText="label"
                labelSize={1.5}
                labelDotRadius={0.4}
                labelColor={() => 'rgba(255, 255, 255, 0.75)'}
                labelResolution={2}
            />
            {/* Overlay */}
            <div className="absolute top-10 left-10 z-10">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] mb-2">Live Network Status</p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-xl font-serif font-bold text-white tracking-tight">Vanguard Visualization</p>
                </div>
            </div>
        </div>
    );
};

export default GlobalNetworkGlobe;
