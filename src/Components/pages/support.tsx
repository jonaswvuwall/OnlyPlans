import Layout from '../ui/Layout';
import { Button } from '../ui/button';
import { useTranslation } from '../../hooks/useTranslation';
import type { FC } from 'react';

const Support: FC = () => {
  const { t } = useTranslation();

  const handleSelectPlan = (planName: string) => {
    alert(`Herzlichen Glückwunsch! Sie haben das ${planName} Paket ausgewählt. Unser Verkaufsteam wird sich in den nächsten 3-5 Geschäftstagen bei Ihnen melden! 💰`);
  };

  const packages = {
    basic: {
      name: 'Goldener Standard',
      price: '€999',
      period: '/Monat',
      description: 'Für anspruchsvolle Einsteiger',
      features: [
        '24/7 Email Support*',
        'Antwortzeit: 48-72h',
        '1 Telefonsupport/Monat',
        'Grundlegende Tutorials',
        'Community Forum Zugang'
      ],
      disclaimer: '*Nur an Werktagen'
    },
    premium: {
      name: 'Platin Elite',
      price: '€4.999',
      period: '/Monat',
      description: 'Für wahre Profis',
      features: [
        'Persönlicher Support-Butler',
        'Antwortzeit: 30 Minuten',
        'Unlimited Telefonsupport',
        'Exklusive Masterclass-Sessions',
        'Priority Queue in allem',
        'Persönliche WhatsApp-Nummer'
      ]
    },
    enterprise: {
      name: 'Diamant Imperium',
      price: '€49.999',
      period: '/Monat',
      description: 'Für absolute Leistungsträger',
      features: [
        'Dedicated Support-Team (24 Personen)',
        'Sofortige Antworten (unter 30 Sekunden)',
        'Persönlicher Besuch vor Ort',
        'Custom Software-Entwicklung',
        'Lebenslanges VIP-Coaching',
        'Direkter CEO-Kontakt',
        'Goldene Visitenkarte',
        'Yacht-Meeting verfügbar'
      ]
    }
  };

  const testimonials = [
    {
      name: 'Dr. Max Mustermann',
      company: 'Mustermann GmbH',
      text: 'Für nur €49.999 im Monat bekomme ich Support, der fast so gut ist wie Google! Unglaublich!',
      rating: 5
    },
    {
      name: 'Anna Schmidt',
      company: 'Schmidt Consulting',
      text: 'Die Mitarbeiter sind sehr attraktiv. Das Geld war es wert.',
      rating: 4
    },
    {
      name: 'Peter Johnson',
      company: 'Johnson Ltd.',
      text: 'Ich bin zwar bankrott, aber ich habe Netzpläne! Ich gebe 6 aus 5 Sternen.',
      rating: 6
    }
  ];

  return (
    <Layout>
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-7xl mx-auto px-6 min-h-[calc(100vh-200px)] py-12">
        
        <div className="text-center space-y-6 mb-16">
          <div className="text-6xl mb-4">💎</div>
          <h1 className="text-6xl font-bold text-white mb-6">
            {t('support.title')}
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            {t('support.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16 w-full max-w-6xl">
          
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 hover:bg-white/15 hover:scale-105 transition-all duration-300 flex flex-col h-full">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🥇</div>
              <h3 className="text-2xl font-bold text-white mb-2">{packages.basic.name}</h3>
              <p className="text-white/60 mb-4">{packages.basic.description}</p>
              <div className="text-center">
                <span className="text-4xl font-bold text-yellow-400">{packages.basic.price}</span>
                <span className="text-white/60 text-lg">{packages.basic.period}</span>
              </div>
            </div>
            
            <div className="flex-grow">
              <ul className="space-y-3 mb-6">
                {packages.basic.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-green-400 text-sm mt-1">✓</span>
                    <span className="text-white/80 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-white/40 italic">{packages.basic.disclaimer}</p>
            </div>
            
            <Button 
              className="w-full mt-6 bg-yellow-600 hover:bg-yellow-700 transition-all duration-300 hover:scale-105"
              onClick={() => handleSelectPlan(packages.basic.name)}
            >
              {t('support.cta.selectPlan')}
            </Button>
          </div>

          <div className="bg-white/10 backdrop-blur-md border-2 border-purple-400 rounded-xl p-8 hover:bg-white/15 hover:scale-105 transition-all duration-300 flex flex-col h-full relative">
            
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold text-white mb-2">{packages.premium.name}</h3>
              <p className="text-white/60 mb-4">{packages.premium.description}</p>
              <div className="text-center">
                <span className="text-4xl font-bold text-purple-400">{packages.premium.price}</span>
                <span className="text-white/60 text-lg">{packages.premium.period}</span>
              </div>
            </div>
            
            <div className="flex-grow">
              <ul className="space-y-3 mb-6">
                {packages.premium.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-green-400 text-sm mt-1">✓</span>
                    <span className="text-white/80 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <Button 
              className="w-full mt-6 bg-purple-600 hover:bg-purple-700 transition-all duration-300 hover:scale-105"
              onClick={() => handleSelectPlan(packages.premium.name)}
            >
              {t('support.cta.selectPlan')}
            </Button>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 hover:bg-white/15 hover:scale-105 transition-all duration-300 flex flex-col h-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-yellow-600/10 pointer-events-none"></div>
            
            <div className="text-center mb-6 relative z-10">
              <div className="text-4xl mb-4">💎</div>
              <h3 className="text-2xl font-bold text-white mb-2">{packages.enterprise.name}</h3>
              <p className="text-white/60 mb-4">{packages.enterprise.description}</p>
              <div className="text-center">
                <span className="text-4xl font-bold text-yellow-400">{packages.enterprise.price}</span>
                <span className="text-white/60 text-lg">{packages.enterprise.period}</span>
              </div>
            </div>
            
            <div className="flex-grow relative z-10">
              <ul className="space-y-3 mb-6">
                {packages.enterprise.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-yellow-400 text-sm mt-1">💎</span>
                    <span className="text-white/80 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <Button 
              className="w-full mt-6 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 transition-all duration-300 hover:scale-105 relative z-10"
              onClick={() => handleSelectPlan(packages.enterprise.name)}
            >
              {t('support.cta.contactSales')}
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16 w-full max-w-5xl">
          <div className="text-center p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
            <div className="text-3xl mb-4">🎯</div>
            <h4 className="text-lg font-semibold text-white mb-2">{t('support.features.satisfaction.title')}</h4>
            <p className="text-white/60 text-sm">{t('support.features.satisfaction.description')}</p>
          </div>
          
          <div className="text-center p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
            <div className="text-3xl mb-4">👨‍💼</div>
            <h4 className="text-lg font-semibold text-white mb-2">{t('support.features.experts.title')}</h4>
            <p className="text-white/60 text-sm">{t('support.features.experts.description')}</p>
          </div>
          
          <div className="text-center p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
            <div className="text-3xl mb-4">⏰</div>
            <h4 className="text-lg font-semibold text-white mb-2">{t('support.features.availability.title')}</h4>
            <p className="text-white/60 text-sm">{t('support.features.availability.description')}</p>
          </div>
        </div>
        <div className="w-full max-w-6xl mb-12">
          <h3 className="text-3xl font-bold text-white text-center mb-12">{t('support.testimonials.title')}</h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((review, index: number) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400 text-sm">
                    {[...Array(review.rating)].map((_, i) => (
                      <span key={i}>⭐</span>
                    ))}
                  </div>
                </div>
                <p className="text-white/80 text-sm mb-4 italic">"{review.text}"</p>
                <div className="text-white font-medium text-sm">{review.name}</div>
                <div className="text-white/60 text-xs">{review.company}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <div className="text-4xl mb-4">🚀</div>
          <h3 className="text-2xl font-bold text-white mb-4">Bereit für Premium Support?</h3>
          <p className="text-white/60 mb-6">Starten Sie noch heute mit unserer exklusiven Testversion!</p>
          <Button 
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 hover:scale-105 text-lg px-8 py-4"
            onClick={() => alert('Ihre 5-Minuten Testversion wurde aktiviert! Ein Timer läuft jetzt in unserem System. ⏰')}
          >
            {t('support.cta.startTrial')}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Support;