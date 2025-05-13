                <div className="mb-4">
                  <label
                    htmlFor="lyrics"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Lyrics
                  </label>
                  <div className="relative">
                    <textarea
                      id="lyrics"
                      name="lyrics"
                      rows={10}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={formData.lyrics || ''}
                      onChange={handleChange}
                      placeholder="Enter song lyrics here..."
                    />
                    {audioRef && audioRef.current && formData.lyrics && (
                      <button
                        type="button"
                        onClick={() => {
                          // Create a temporary audio element if we don't have one
                          const tempAudio = new Audio(audioSrc || formData.file);
                          // Wait for metadata to load to get duration
                          tempAudio.addEventListener('loadedmetadata', () => {
                            const syncedLyrics = formatLyricsWithTimestamps(formData.lyrics, tempAudio);
                            setFormData({...formData, lyrics: syncedLyrics});
                            toast.success('Lyrics synchronized with estimated timestamps');
                          });
                          // Handle error
                          tempAudio.addEventListener('error', () => {
                            toast.error('Could not load audio to sync lyrics');
                          });
                          // Load the audio to trigger metadata loading
                          tempAudio.load();
                        }}
                        className="absolute top-2 right-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-md px-2 py-1"
                      >
                        Auto-Sync Lyrics
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    For time-synced lyrics, use this format: [mm:ss.xx]Lyrics text
                    <br />
                    Example: 
                    <br />
                    [00:00.00]Song Title
                    <br />
                    [00:02.10]First line of lyrics
                    <br />
                    [00:05.45]Second line that appears at 5.45 seconds
                    <br />
                    [Chorus]
                    <br />
                    [00:20.30]First line of chorus
                  </p>
                </div> 