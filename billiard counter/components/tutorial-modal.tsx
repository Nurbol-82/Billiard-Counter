"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type React from "react"

interface TutorialModalProps {
  isOpen: boolean
  onClose: () => void
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white/10 backdrop-blur-lg border border-white/20 text-white rounded-xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-yellow-400">
            Правила игры в Русский бильярд (Пирамида)
          </DialogTitle>
          <DialogDescription className="text-white/80 mt-2">
            Краткое руководство по основным правилам игры в Русский бильярд (Пирамида).
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4 text-white/90 text-sm max-h-[60vh] overflow-y-auto pr-2">
          <h3 className="font-semibold text-lg text-green-400">Цель игры:</h3>
          <p>
            Забить определенное количество шаров (или набрать очки), используя любой шар на столе. Обычно игра ведется
            до 8 забитых шаров.
          </p>

          <h3 className="font-semibold text-lg text-green-400">Шары:</h3>
          <p>
            Используется 16 шаров: 15 белых прицельных шаров и 1 цветной (обычно желтый или красный) биток. Все шары
            одного размера.
          </p>

          <h3 className="font-semibold text-lg text-green-400">Начало игры (Разбивка):</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Прицельные шары расставляются в пирамиду. Биток располагается в доме.</li>
            <li>
              Разбивающий игрок должен ударить по шарам так, чтобы:
              <ul className="list-circle list-inside ml-4">
                <li>Хотя бы один прицельный шар был забит.</li>
                <li>Или хотя бы один прицельный шар коснулся борта.</li>
              </ul>
            </li>
            <li>Если при разбивке забит биток, это фол.</li>
          </ul>

          <h3 className="font-semibold text-lg text-green-400">Ход игры:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Игрок может забивать любой прицельный шар на столе.</li>
            <li>
              **"Свой" шар (забивание битка):** Если биток забит в лузу после соударения с прицельным шаром, это
              считается правильным ударом. Забитый прицельный шар засчитывается, а биток выставляется на стол.
            </li>
            <li>
              **"Чужой" шар (забивание прицельного шара):** Если прицельный шар забит в лузу, это считается правильным
              ударом. Биток остается на месте.
            </li>
            <li>Игрок продолжает свой ход, пока он правильно забивает шары.</li>
          </ul>

          <h3 className="font-semibold text-lg text-green-400">Фолы (Нарушения):</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Биток не коснулся ни одного прицельного шара.</li>
            <li>Биток или прицельный шар вылетел за пределы стола.</li>
            <li>Касание шаров рукой, одеждой или кием (кроме кончика кия во время удара).</li>
            <li>Удар по шару, который еще движется.</li>
            <li>Перескакивание битка через прицельный шар.</li>
            <li>Забивание битка без касания прицельного шара.</li>
          </ul>

          <h3 className="font-semibold text-lg text-green-400">Штрафы:</h3>
          <p>
            За каждый фол игрок передает один из ранее забитых шаров сопернику. Если у игрока нет забитых шаров,
            штрафной шар снимается после того, как он забьет свой первый шар. Право хода переходит к другому игроку.
          </p>

          <h3 className="font-semibold text-lg text-green-400">Победа:</h3>
          <p>
            Игрок, первым забивший 8 шаров (или набравший необходимое количество очков, в зависимости от разновидности
            Пирамиды), выигрывает партию.
          </p>
        </div>
        <div className="flex justify-end mt-6">
          <Button
            onClick={onClose}
            className="bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out"
          >
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
