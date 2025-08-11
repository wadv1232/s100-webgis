'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { i18nConfig } from './config'

type Language = 'en' | 'zh'

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('zh')

  useEffect(() => {
    // 从localStorage获取语言设置
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'zh')) {
      setLanguage(savedLanguage)
    } else {
      // 根据浏览器语言自动设置
      const browserLanguage = navigator.language.toLowerCase()
      if (browserLanguage.startsWith('en')) {
        setLanguage('en')
      } else {
        setLanguage('zh')
      }
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  // 翻译函数
  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = i18nConfig.resources[language].translation
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        // 如果当前语言没有找到，尝试使用回退语言
        if (language !== i18nConfig.fallbackLng) {
          let fallbackValue: any = i18nConfig.resources[i18nConfig.fallbackLng as Language].translation
          for (const fallbackKey of keys) {
            if (fallbackValue && typeof fallbackValue === 'object' && fallbackKey in fallbackValue) {
              fallbackValue = fallbackValue[fallbackKey]
            } else {
              return key // 如果回退语言也没有找到，返回key
            }
          }
          return fallbackValue
        }
        return key // 如果没有找到，返回key
      }
    }
    
    return typeof value === 'string' ? value : key
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

// 语言切换组件
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Globe } from 'lucide-react'

interface LanguageSwitcherProps {
  className?: string
  variant?: 'select' | 'button'
}

export function LanguageSwitcher({ className, variant = 'select' }: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useI18n()

  const languages = [
    { code: 'zh' as Language, name: '中文', flag: '🇨🇳' },
    { code: 'en' as Language, name: 'English', flag: '🇺🇸' }
  ]

  if (variant === 'button') {
    return (
      <div className="flex items-center space-x-1">
        {languages.map((lang) => (
          <Button
            key={lang.code}
            variant={language === lang.code ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLanguage(lang.code)}
            className={className}
            title={lang.name}
          >
            <span className="mr-1">{lang.flag}</span>
            {lang.code.toUpperCase()}
          </Button>
        ))}
      </div>
    )
  }

  return (
    <Select value={language} onValueChange={(value: Language) => setLanguage(value)}>
      <SelectTrigger className={`w-32 ${className}`}>
        <Globe className="h-4 w-4 mr-2" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <div className="flex items-center space-x-2">
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}