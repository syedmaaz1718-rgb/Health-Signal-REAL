from pathlib import Path
import numpy as np,json,hashlib
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score,roc_auc_score,confusion_matrix,brier_score_loss
P=Path(__file__).resolve().parents[1]
def fit(name,features,X,y,source):
 a,b=train_test_split(np.arange(len(y)),test_size=.25,stratify=y,random_state=42)
 im=SimpleImputer(strategy='median').fit(X[a]);sc=StandardScaler().fit(im.transform(X[a]));m=LogisticRegression(C=1,max_iter=2000,random_state=42).fit(sc.transform(im.transform(X[a])),y[a]);pred=m.predict_proba(sc.transform(im.transform(X[b])))[:,1]
 metrics={'accuracy':accuracy_score(y[b],pred>=.5),'roc_auc':roc_auc_score(y[b],pred),'brier':brier_score_loss(y[b],pred),'confusion_matrix':confusion_matrix(y[b],pred>=.5).tolist(),'train_rows':len(a),'test_rows':len(b),'split':'Stratified 75/25 split, seed 42; imputer and scaler fit on training set only.'}
 sample=im.statistics_.tolist()
 (P/'tests'/f'{name.split()[0].lower()}-parity.json').write_text(json.dumps({'values':sample,'expected':float(m.predict_proba(sc.transform([sample]))[0,1])}))
 return {'kind':'standardized-logistic','name':name,'features':features,'median':im.statistics_.tolist(),'mean':sc.mean_.tolist(),'scale':sc.scale_.tolist(),'coefficients':m.coef_[0].tolist(),'intercept':float(m.intercept_[0]),'metrics':metrics,'source':source,'min':np.nanmin(X[a],axis=0).tolist(),'max':np.nanmax(X[a],axis=0).tolist()}
pima=np.genfromtxt(P/'data/pima.csv',delimiter=',');X=pima[:,[1,2,5,7]].copy();X[X==0]=np.nan
heart=np.genfromtxt(P/'data/cleveland.csv',delimiter=',',missing_values='?',filling_values=np.nan)
models={'diabetes':fit('Pima diabetes label',['2-hour OGTT glucose (mg/dL)','Diastolic BP (mmHg)','BMI (kg/m²)','Age (years)'],X,pima[:,-1].astype(int),'https://raw.githubusercontent.com/jbrownlee/Datasets/master/pima-indians-diabetes.csv'),'heart':fit('Cleveland heart-disease label',['Age (years)','Sex coding (0 female, 1 male)','Resting systolic BP (mmHg)','Cholesterol (mg/dL)'],heart[:,[0,1,3,4]],(heart[:,-1]>0).astype(int),'https://archive.ics.uci.edu/ml/machine-learning-databases/heart-disease/processed.cleveland.data')}
models['note']='Historical disease-label classifier scores, not future risk or diagnosis. Reduced-feature models; no external validation or clinical calibration.'
models['hashes']={f:hashlib.sha256((P/'data'/f).read_bytes()).hexdigest() for f in ['pima.csv','cleveland.csv']}
(P/'models/model.json').write_text(json.dumps(models))
print({k:v['metrics'] for k,v in models.items() if isinstance(v,dict) and 'metrics' in v})
