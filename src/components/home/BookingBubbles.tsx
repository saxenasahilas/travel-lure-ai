"use client";

interface BookingBubblesProps {
    location: string;
}

export default function BookingBubbles({ location }: BookingBubblesProps) {
    const encodedLoc = encodeURIComponent(location);

    const LINKS = [
        {
            name: "Flights",
            url: `https://www.skyscanner.co.in/transport/flights/in/${encodedLoc}`, // Basic link pattern, usually needs airport code but this serves as Intent
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.7l-1.2 4 6 3.2-2 2-4-1.5L1 16l7.4 1.6c.7.1 1.4-.1 1.9-.6l4.1-4.1 3.4 6.3c.5.2 1.1.2 1.5-.1.5-.5.5-1 .3-1.4Z" /></svg>
            ),
            color: "bg-sky-500",
        },
        {
            name: "Stays",
            url: `https://www.booking.com/searchresults.html?ss=${encodedLoc}`,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10v11h6v-7h6v7h6v-11L12 3z" /><path d="M9 21V9" /><path d="M15 21V9" /></svg>
            ),
            color: "bg-blue-700",
        },
        {
            name: "Transport",
            url: `https://12go.asia/en/travel/${encodedLoc}`,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="16" x="4" y="4" rx="2" /><path d="M4 11h16" /><path d="M12 4v16" /><path d="m8 8-4 4 4 4" /><path d="m16 8 4 4-4 4" /></svg>
            ), // Using generic icon
            color: "bg-green-600",
        }
    ];

    return (
        <div className="flex gap-4 mt-6 flex-wrap justify-center">
            {LINKS.map((link) => (
                <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${link.color} text-white px-5 py-2.5 rounded-full flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-sm font-semibold`}
                >
                    {link.icon}
                    <span>Book {link.name}</span>
                </a>
            ))}
        </div>
    );
}
