import type React from "react"

interface PodiumIllustrationProps {
  winnerName: string
  secondPlaceName: string
  thirdPlaceName: string
}

export const PodiumIllustration: React.FC<PodiumIllustrationProps> = ({
  winnerName,
  secondPlaceName,
  thirdPlaceName,
}) => {
  return (
    <div className="relative w-full max-w-md mx-auto flex flex-col items-center">
      <div className="w-full max-w-[400px] mx-auto mb-4">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/podium_animated-DDSxVOSdb12rBIacfVCxT7vLQ6aYuA.gif"
          alt="Подиум с победителями"
          className="w-full h-auto"
        />
      </div>
      <div className="flex justify-between w-full max-w-[400px] mt-2">
        <div className="text-center w-1/3 px-2">
          <p className="text-white font-semibold text-sm sm:text-base">{secondPlaceName}</p>
          <p className="text-yellow-300 text-xs">2 место</p>
        </div>
        <div className="text-center w-1/3 px-2">
          <p className="text-white font-semibold text-sm sm:text-base">{winnerName}</p>
          <p className="text-yellow-300 text-xs">1 место</p>
        </div>
        <div className="text-center w-1/3 px-2">
          <p className="text-white font-semibold text-sm sm:text-base">{thirdPlaceName}</p>
          <p className="text-yellow-300 text-xs">3 место</p>
        </div>
      </div>
    </div>
  )
}
