import { useEffect, useState } from "react";
import {
  FaTv,
  FaPlayCircle,
} from "react-icons/fa";

import HorizontalRow from "../Resuable Styling/HorizontalRow";

import {
  getNetflixMovies,
  getPrimeMovies,
  getDisneyMovies,
  getAppleMovies,
  getHotstarMovies,
} from "../../Services/movieService";

function OttMovies() {

  const [loading, setLoading] = useState(true);

  const [netflix, setNetflix] = useState([]);
  const [prime, setPrime] = useState([]);
  const [disney, setDisney] = useState([]);
  const [apple, setApple] = useState([]);
  const [hotstar, setHotstar] = useState([]);

  useEffect(() => {
    loadMovies();
  }, []);

  async function loadMovies() {

    try {

      setLoading(true);

      const [
        netflixRes,
        primeRes,
        disneyRes,
        appleRes,
        hotstarRes,
      ] = await Promise.all([
        getNetflixMovies(),
        getPrimeMovies(),
        getDisneyMovies(),
        getAppleMovies(),
        getHotstarMovies(),
      ]);

      setNetflix(netflixRes.data.results);
      setPrime(primeRes.data.results);
      setDisney(disneyRes.data.results);
      setApple(appleRes.data.results);
      setHotstar(hotstarRes.data.results);

    } catch (err) {
      console.log(err);
    }

    finally {
      setLoading(false);
    }

  }

  return (

    <div className="min-h-screen bg-[#090909] text-white">

      <section className="bg-gradient-to-r from-purple-900 via-black to-black">

        <div className="max-w-7xl mx-auto px-8 py-16">

          <div className="flex items-center gap-5">

            <FaTv className="text-5xl text-purple-500"/>

            <div>

              <h1 className="text-5xl font-black">

                OTT Movies

              </h1>

              <p className="text-gray-300 mt-3">

                Discover movies streaming across your favourite platforms.

              </p>

            </div>

          </div>

          <div className="flex flex-wrap gap-4 mt-10">

            <div className="bg-[#171717] rounded-xl px-5 py-3 flex items-center gap-3">

              <FaPlayCircle className="text-red-500"/>

              Netflix

            </div>

            <div className="bg-[#171717] rounded-xl px-5 py-3">

              Prime Video

            </div>

            <div className="bg-[#171717] rounded-xl px-5 py-3">

              Disney+

            </div>

            <div className="bg-[#171717] rounded-xl px-5 py-3">

              Apple TV+

            </div>

            <div className="bg-[#171717] rounded-xl px-5 py-3">

              JioHotstar

            </div>

          </div>

        </div>

      </section>

      <div className="max-w-7xl mx-auto py-10 px-8">
              {loading ? (

        <div className="space-y-12">

          {[...Array(5)].map((_, i) => (

            <div key={i}>

              <div className="w-64 h-8 bg-[#1a1a1a] rounded animate-pulse mb-6"/>

              <div className="flex gap-5 overflow-hidden">

                {[...Array(6)].map((_, j)=>(

                  <div
                    key={j}
                    className="min-w-[220px] h-[330px] bg-[#1a1a1a] rounded-xl animate-pulse"
                  />

                ))}

              </div>

            </div>

          ))}

        </div>

      ) : (

        <>

          <HorizontalRow
            title="🔥 Trending on Netflix"
            shows={netflix}
          />

          <HorizontalRow
            title="📦 Prime Video"
            shows={prime}
          />

          <HorizontalRow
            title="🏰 Disney+"
            shows={disney}
          />

          <HorizontalRow
            title="🍎 Apple TV+"
            shows={apple}
          />

          <HorizontalRow
            title="⭐ JioHotstar"
            shows={hotstar}
          />

        </>

      )}

      </div>

    </div>

  );

}

export default OttMovies;