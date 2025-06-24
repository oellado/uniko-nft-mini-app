# Unikō Monitoring Setup

## 🔍 What to Monitor

### **Smart Contract Health**
- Minting functionality working
- Contract not paused unexpectedly  
- Gas costs staying reasonable
- Revenue accumulating correctly

### **Website/Mini App Status**
- Site loading properly (uniko.miguelgarest.com)
- Wallet connections working
- Minting interface functional
- Mobile compatibility maintained

### **User Experience**
- NFTs displaying correctly
- Metadata loading on OpenSea
- Transaction success rates

## 🛠️ Easy Monitoring Tools

### **1. Alchemy Dashboard** (Already have!)
- Monitor RPC usage and performance
- Track transaction success rates
- View error logs and issues
- URL: https://dashboard.alchemy.com

### **2. BaseScan Contract Monitoring**
- Bookmark your contract pages:
  - Main: https://basescan.org/address/[MAINNET_ADDRESS]
  - Renderer: https://basescan.org/address/[RENDERER_ADDRESS]
- Check recent transactions
- Monitor for unusual activity

### **3. Vercel Analytics** (Free with your account)
- Monitor website uptime (uniko.miguelgarest.com)
- Track user visits and errors
- View performance metrics
- Already built into your Vercel dashboard

### **4. Simple Health Check Script**
Create a basic monitoring script you can run:

```bash
# Add to your project - scripts/monitoring/health-check.js
node scripts/monitoring/health-check.js
```

## 📊 Key Metrics to Watch

### **During Launch Day**
- [ ] Website response time < 3 seconds
- [ ] Mint transactions succeeding > 95%
- [ ] Gas costs reasonable (not spiking)
- [ ] No contract errors in BaseScan
- [ ] Alchemy RPC staying under rate limits

### **Post-Launch Monitoring**
- [ ] All minted NFTs displaying correctly
- [ ] OpenSea metadata loading properly
- [ ] Royalties being paid correctly
- [ ] No security issues reported

## 🚨 Alert Thresholds

### **Immediate Action Needed**
- Website down for > 5 minutes
- Minting failing > 10% of attempts
- Contract showing errors on BaseScan
- Gas costs > 3x normal

### **Investigation Needed**
- Website loading slowly (> 5 seconds)
- Unusual transaction patterns
- High RPC usage approaching limits
- User complaints about functionality

## 📱 Simple Monitoring Routine

### **Launch Day - Check Every 30 Minutes**
1. Visit uniko.miguelgarest.com → Does it load?
2. Check Alchemy dashboard → Any errors?
3. Check BaseScan → Recent transactions look normal?
4. Test mint function → Does it work?

### **Week 1 - Check Daily**
1. Website still working?
2. Any new NFTs displaying correctly?
3. OpenSea collection loading properly?
4. Any user issues reported?

### **Ongoing - Check Weekly**
1. Contract still functioning normally?
2. Website performance good?
3. Any security concerns?

## 🔧 Emergency Monitoring Commands

### **Quick Contract Status Check**
```bash
node scripts/admin/check-status.js
```

### **Test Website Functionality**
- Open uniko.miguelgarest.com in private/incognito browser
- Try connecting wallet
- Check if minting interface loads

### **Monitor Contract Events**
- Watch BaseScan for recent transactions
- Check for any error transactions
- Verify minting events are being emitted

## 📈 Success Metrics

### **Technical Success**
- ✅ Website uptime > 99%
- ✅ Transaction success rate > 95%
- ✅ All NFTs displaying correctly
- ✅ No security incidents

### **Art Project Success**
- ✅ Users can mint and view their Unikōs
- ✅ NFTs look correct on all platforms
- ✅ Clean, professional launch execution
- ✅ Positive user feedback

---

**Remember**: Simple monitoring beats complex monitoring. Start with basics and add more as needed. 