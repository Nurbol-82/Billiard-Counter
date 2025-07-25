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
          <DialogTitle className="text-2xl font-bold text-yellow-400">Правила игры в Пул 8</DialogTitle>
          <DialogDescription className="text-white/80 mt-2">
            Краткое руководство по основным правилам игры в бильярд (Пул 8).
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4 text-white/90 text-sm max-h-[60vh] overflow-y-auto pr-2">
          <h3 className="font-semibold text-lg text-green-400">Цель игры:</h3>
          <p>
            Забить все шары своей группы (сплошные 1-7 или полосатые 9-15), а затем забить черный шар (№8) в любую лузу.
          </p>

          <h3 className="font-semibold text-lg text-green-400">Начало игры (Разбивка):</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Шары расставляются в треугольник, черный шар №8 находится в центре третьего ряда.</li>
            <li>
              Разбивающий игрок должен ударить по шарам так, чтобы:
              <ul className="list-circle list-inside ml-4">
                <li>Один шар был забит.</li>
                <li>Или четыре прицельных шара коснулись бортов.</li>
              </ul>
            </li>
            <li>
              Если черный шар забит при разбивке, разбивающий может:
              <ul className="list-circle list-inside ml-4">
                <li>Переставить шары и разбить снова.</li>
                <li>Выставить черный шар на стол и продолжить игру.</li>
              </ul>
            </li>
          </ul>

          <h3 className="font-semibold text-lg text-green-400">Определение групп:</h3>
          <p>
            Группы (сплошные 1-7 или полосатые 9-15) определяются только после того, как игрок **правильно забил** шар
            после разбивки.
          </p>
          <p>Если при разбивке забиты шары обеих групп, игрок выбирает свою группу.</p>

          <h3 className="font-semibold text-lg text-green-400">Ход игры:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Игрок продолжает свой ход, пока он правильно забивает шары своей группы.</li>
            <li>После забивания последнего шара своей группы, игрок должен забить черный шар №8.</li>
            <li>Перед ударом по черному шару, игрок должен объявить лузу.</li>
          </ul>

          <h3 className="font-semibold text-lg text-green-400">Фолы (Нарушения):</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Забивание битка (белого шара).</li>
            <li>Не касание битка прицельного шара.</li>
            <li>Не касание шаром борта после соударения.</li>
            <li>Выбивание шара со стола.</li>
            <li>Касание шаров рукой или одеждой.</li>
            <li>Забивание черного шара до того, как забиты все шары своей группы.</li>
          </ul>

          <h3 className="font-semibold text-lg text-green-400">Проигрыш:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Забивание черного шара с фолом.</li>
            <li>Забивание черного шара в неправильную лузу.</li>
            <li>Забивание черного шара, когда на столе еще есть шары вашей группы.</li>
            <li>Выбивание черного шара со стола.</li>
          </ul>
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
