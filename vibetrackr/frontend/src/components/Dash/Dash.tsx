import { Navbar2 } from "../Navbar/navbar2";
import { JournalCard } from "./JournalCard";
import { JournalTable } from "./JournalTable";
import { JournalCalendar } from "./JournalCalendar";
import { RecentEmotion } from "./RecentEmotion";
import { EmotionGraph } from "./EmotionGraph";

export function Dash({ userdata }: { userdata: any }) {
    return (
        <div>
            <Navbar2 userdata={userdata} />
            <div className="ml-10 mr-10 mb-10 mt-10">
                <p className="text-4xl ml-6 text-gray-400 mt-4">Overview</p>
                <br />
                <div className="pl-6 pr-6 pb-6">
                    {/* Top Section: Two Halves */}
                    <div className="flex flex-col lg:flex-row gap-6 mb-6">
                        {/* Left Half */}
                        <div className="flex flex-col w-full lg:w-1/2 gap-6">
                            {/* Top part of Left Half: JournalCard and RecentEmotion side-by-side */}
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1 h-full"> {/* flex-1 will make them share space, h-full to try and match height */}
                                    <JournalCard />
                                </div>
                                <div className="flex-1 h-full"> {/* flex-1 will make them share space, h-full to try and match height */}
                                    <RecentEmotion />
                                </div>
                            </div>
                            {/* Bottom part of Left Half: EmotionGraph */}
                            <div className="w-full">
                                <EmotionGraph />
                            </div>
                        </div>

                        {/* Right Half: JournalCalendar */}
                        {/* For the calendar to take the full height of the right side,
                            its parent needs a defined height or it needs to stretch.
                            We can make the parent flex container (lg:flex-row) have items-stretch
                            and the calendar's direct parent div take h-full. */}
                        <div className="w-full lg:w-1/2 flex"> {/* Added flex here */}
                            <JournalCalendar className="flex-grow" /> {/* flex-grow to take available space */}
                        </div>
                    </div>

                    {/* Bottom Section: JournalTable */}
                    <div className="mt-6">
                        <JournalTable />
                    </div>
                </div>
            </div>
        </div>
    );
}