import silhouette from '../assets/player-silhouette.png';

interface Props {
  className?: string;
}

export default function PlayerSilhouette({ className = '' }: Props) {
  return (
    <div className={`w-full h-full bg-snfc-navy ${className}`}>
      <img
        src={silhouette}
        alt=""
        className="w-full h-full object-cover object-top"
      />
    </div>
  );
}
