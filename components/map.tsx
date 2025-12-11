import React from 'react';

interface MapProps {
    src?: string;
    title?: string;
    className?: string;
}

export const MapComponent: React.FC<MapProps> = ({
    src = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2507.6870409552694!2d77.52985749220866!3d12.941118163650012!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae3f371f9b0587%3A0x42504ebf37946eb2!2sNandi%20Link%20Grounds!5e0!3m2!1sen!2sin!4v1763577784421!5m2!1sen!2sin",
    title = "Event Location - Nandi Link Grounds",
    className = "",
}) => {
    return (
        <section className={`px-4 md:px-6 bg-orange-500/30 ${className}`}>
            <div className="max-w-7xl mx-auto">
                <div className="w-full aspect-video max-w-5xl mx-auto rounded-xl overflow-hidden shadow-2xl border-4 border-primary/20">
                    <iframe
                        src={src}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={title}
                    />
                </div>
            </div>
        </section>
    );
};

export default Map;
