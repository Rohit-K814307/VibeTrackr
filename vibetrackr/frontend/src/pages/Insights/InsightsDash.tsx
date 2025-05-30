// pages/InsightsDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Insights } from '@/pages/Insights/Insights';
import type { JournalEntry } from '@/types/journal';
import { Navbar2 } from '@/components';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'; // Added CardHeader, CardTitle, CardContent, CardDescription
import { Badge } from '@/components/ui/badge';

// Lucide React Icons
import { LineChart, Lightbulb, Headphones } from 'lucide-react';

import { getAuth } from "firebase/auth";
import { fetchWithRetry } from "@/utils";

interface MoodMentorData {
  mentor: {
    [issueName: string]: {
      Steps: string[];
      Therapies: string[];
      Sources: string[];
    };
  }[];
}

interface SpotifyTrack {
  track_name: string;
  artist_name: string;
  genre: string;
  track_id: string;
  image_url: string | null;
}

interface SpotifyRecsData {
  recs: SpotifyTrack[];
}

function InsightsDash() {
  const [journalData, setJournalData] = useState<JournalEntry[]>([]);
  const [moodMentorData, setMoodMentorData] = useState<MoodMentorData | null>(null);
  const [spotifyRecsData, setSpotifyRecsData] = useState<SpotifyRecsData | null>(null); // New state for Spotify data
  const [loadingJournals, setLoadingJournals] = useState(true);
  const [loadingMoodMentor, setLoadingMoodMentor] = useState(false);
  const [loadingSpotifyRecs, setLoadingSpotifyRecs] = useState(false); // New loading state for Spotify
  const [errorJournals, setErrorJournals] = useState<string | null>(null);
  const [errorMoodMentor, setErrorMoodMentor] = useState<string | null>(null);
  const [errorSpotifyRecs, setErrorSpotifyRecs] = useState<string | null>(null); // New error state for Spotify
  const [activeTab, setActiveTab] = useState<string>('charts');

  async function getIdToken() {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error("No user logged in. Please log in to view insights.");
    return await user.getIdToken(true);
  }

  useEffect(() => {
    const fetchUserJournals = async () => {
      setLoadingJournals(true);
      setErrorJournals(null);
      try {
        const token = await getIdToken();
        const response = await fetchWithRetry(import.meta.env.VITE_API_BASE_URL + "/get-user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API call failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        if (data && data.journals && Array.isArray(data.journals)) {
          setJournalData(data.journals);
        } else {
          setJournalData([]);
        }
      } catch (err: any) {
        setErrorJournals(err.message || "An unknown error occurred while fetching journals.");
      } finally {
        setLoadingJournals(false);
      }
    };

    fetchUserJournals();
  }, []);

  useEffect(() => {
    const fetchMoodMentor = async () => {
      if (activeTab === 'mood-mentor' && !moodMentorData && !loadingMoodMentor) {
        setLoadingMoodMentor(true);
        setErrorMoodMentor(null);
        try {
          const token = await getIdToken();
          const response = await fetchWithRetry(import.meta.env.VITE_API_BASE_URL + "/get-mood-mentor", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API call failed for Mood Mentor: ${response.status} - ${errorText}`);
          }

          const data = await response.json();
          if (data && data.mentor && Array.isArray(data.mentor)) {
            setMoodMentorData(data);
          } else {
            setMoodMentorData({ mentor: [] });
          }
        } catch (err: any) {
          setErrorMoodMentor(err.message || "An unknown error occurred while fetching mood mentor data.");
        } finally {
          setLoadingMoodMentor(false);
        }
      }
    };

    fetchMoodMentor();
  }, [activeTab, moodMentorData, loadingMoodMentor]);

  useEffect(() => {
    const fetchSpotifyRecs = async () => {
      if (activeTab === 'spotify-recs' && !spotifyRecsData && !loadingSpotifyRecs) {
        setLoadingSpotifyRecs(true);
        setErrorSpotifyRecs(null);
        try {
          const token = await getIdToken();
          const response = await fetchWithRetry(import.meta.env.VITE_API_BASE_URL + "/get-spot-recs", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API call failed for Spotify Recs: ${response.status} - ${errorText}`);
          }

          const data = await response.json();
          if (data && data.recs && Array.isArray(data.recs)) {
            setSpotifyRecsData(data);
          } else {
            setSpotifyRecsData({ recs: [] });
          }
        } catch (err: any) {
          setErrorSpotifyRecs(err.message || "An unknown error occurred while fetching Spotify recommendations.");
        } finally {
          setLoadingSpotifyRecs(false);
        }
      }
    };

    fetchSpotifyRecs();
  }, [activeTab, spotifyRecsData, loadingSpotifyRecs]);

  if (loadingJournals) {
    return (
      <div>
        <Navbar2 />
        <div className="flex justify-center items-center min-h-screen py-20">
          <div role="status">
            <svg
              aria-hidden="true"
              className="w-12 h-12 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (errorJournals) {
    return (
      <div>
        <Navbar2 />
        <div className="flex justify-center items-center h-screen text-red-500">Error: {errorJournals}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar2 />
      <div className="bg-background ml-15 mr-15 mb-10 mt-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto mb-8">
            <TabsTrigger value="charts" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" /> Charts
            </TabsTrigger>
            <TabsTrigger value="mood-mentor" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" /> Mood Mentor
            </TabsTrigger>
            <TabsTrigger value="spotify-recs" className="flex items-center gap-2">
              <Headphones className="h-4 w-4" /> Spotify Recs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="charts">
            <Insights journals={journalData} />
          </TabsContent>

          <TabsContent value="mood-mentor">
            <div className="p-6 border rounded-md min-h-[400px]">
              {loadingMoodMentor ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <svg
                    aria-hidden="true"
                    className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                  <p className="mt-2">Generating Mood Mentor insights...</p>
                </div>
              ) : errorMoodMentor ? (
                <div className="flex flex-col items-center justify-center h-full text-red-500">
                  <p>Error loading Mood Mentor: {errorMoodMentor}</p>
                  <p className="text-sm text-muted-foreground mt-2">Please try again later.</p>
                </div>
              ) : moodMentorData?.mentor && moodMentorData.mentor.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  <h3 className="text-2xl font-semibold mb-4 text-center">Mood Mentor Insights</h3>
                  {moodMentorData.mentor.map((issueObj, index) => {
                    const issueName = Object.keys(issueObj)[0];
                    const issueDetails = issueObj[issueName];

                    return (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-lg font-medium">{issueName}</AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-2">
                            {issueDetails.Steps && issueDetails.Steps.length > 0 && (
                              <Card className="p-4 shadow-sm">
                                <h4 className="text-md font-semibold text-primary mb-2">Steps:</h4>
                                <div className="flex flex-wrap gap-2">
                                  {issueDetails.Steps.map((step, sIdx) => (
                                    <Badge key={sIdx} variant="secondary" className="px-3 py-1 text-sm whitespace-normal text-wrap">
                                      {step}
                                    </Badge>
                                  ))}
                                </div>
                              </Card>
                            )}

                            {issueDetails.Therapies && issueDetails.Therapies.length > 0 && (
                              <Card className="p-4 shadow-sm">
                                <h4 className="text-md font-semibold text-primary mb-2">Therapies:</h4>
                                <div className="flex flex-wrap gap-2">
                                  {issueDetails.Therapies.map((therapy, tIdx) => (
                                    <Badge key={tIdx} variant="outline" className="px-3 py-1 text-sm bg-green-100 text-green-800 whitespace-normal text-wrap">
                                      {therapy}
                                    </Badge>
                                  ))}
                                </div>
                              </Card>
                            )}

                            {issueDetails.Sources && issueDetails.Sources.length > 0 && (
                              <Card className="p-4 shadow-sm">
                                <h4 className="text-md font-semibold text-primary mb-2">Sources:</h4>
                                <div className="space-y-2 text-sm">
                                  {issueDetails.Sources.map((source, srcIdx) => (
                                    <p key={srcIdx}>
                                      <a href={source} target="_blank" rel="noopener noreferrer"
                                         className="text-blue-600 hover:underline flex items-center break-words">
                                        {source.length > 50 ? source.substring(0, 47) + '...' : source}
                                      </a>
                                    </p>
                                  ))}
                                </div>
                              </Card>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>No Mood Mentor insights available yet. Keep journaling!</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="spotify-recs">
            <div className="p-6 border rounded-md min-h-[400px]">
              {loadingSpotifyRecs ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <svg
                    aria-hidden="true"
                    className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                  <p className="mt-2">Fetching Spotify recommendations...</p>
                </div>
              ) : errorSpotifyRecs ? (
                <div className="flex flex-col items-center justify-center h-full text-red-500">
                  <p>Error loading Spotify recommendations: {errorSpotifyRecs}</p>
                  <p className="text-sm text-muted-foreground mt-2">Please try again later.</p>
                </div>
              ) : spotifyRecsData?.recs && spotifyRecsData.recs.length > 0 ? (
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold mb-4 text-center">Your Spotify Recommendations</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {spotifyRecsData.recs.map((track) => (
                      <Card key={track.track_id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardHeader className="p-0">
                          {track.image_url ? (
                            <img
                              src={track.image_url}
                              alt={`${track.track_name} by ${track.artist_name}`}
                              className="w-full h-48 object-cover rounded-t-md"
                              onError={(e) => {
                                e.currentTarget.src = `https://placehold.co/400x400/e0e0e0/000000?text=No+Image`; // Placeholder on error
                              }}
                            />
                          ) : (
                            <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500 rounded-t-md">
                              No Image
                            </div>
                          )}
                        </CardHeader>
                        <CardContent className="p-4">
                          <CardTitle className="text-lg font-bold truncate mb-1">
                            <a href={`https://open.spotify.com/track/${track.track_id}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                {track.track_name}
                            </a>
                          </CardTitle>
                          <CardDescription className="text-sm text-muted-foreground truncate mb-2">
                            {track.artist_name}
                          </CardDescription>
                          {track.genre && (
                            <Badge variant="secondary" className="text-xs px-2 py-0.5 mt-1">
                              {track.genre}
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>No Spotify recommendations available yet. Keep journaling!</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default InsightsDash;