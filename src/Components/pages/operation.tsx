import Layout from '../ui/Layout';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import type { FC } from 'react';

const Operation: FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto px-6 min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-8">
          <h1 className="text-6xl font-bold text-white mb-6">
            {t('operation.title')}
          </h1>
          
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-12">
            {t('operation.subtitle')}
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mt-16 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 hover:bg-white/15 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 flex flex-col h-full card-hover">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-white mb-3">{t('operation.cards.createPlan.title')}</h3>
              <p className="text-white/70 mb-6 flex-grow">{t('operation.cards.createPlan.description')}</p>
              <Button 
                className="w-full mt-auto transition-all duration-300 hover:scale-105 active:scale-95"
                onClick={() => navigate('/create-plan')}
              >
                {t('operation.cards.createPlan.button')}
              </Button>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 hover:bg-white/15 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 flex flex-col h-full card-hover">
              <div className="text-4xl mb-4">✏️</div>
              <h3 className="text-xl font-semibold text-white mb-3">{t('operation.cards.editPlans.title')}</h3>
              <p className="text-white/70 mb-6 flex-grow">{t('operation.cards.editPlans.description')}</p>
              <Button 
                className="w-full mt-auto transition-all duration-300 hover:scale-105 active:scale-95"
                onClick={() => navigate('/manage-plans')}
              >
                {t('operation.cards.editPlans.button')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Operation;