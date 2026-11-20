import MenuScreen from './menu';
import { useSave } from '../game/useSave';

export default function Home() {
  const { save, update } = useSave();
  if (!save) return null;
  return <MenuScreen save={save} onUpdate={update} />;
}
