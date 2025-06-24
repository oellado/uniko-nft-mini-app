# Unikō Incident Response Plan

## 🚨 Emergency Contacts
- **Project Owner**: [Your contact info]
- **Vercel Support**: In case of website issues
- **Alchemy Support**: For RPC infrastructure issues

## 🔧 Common Issues & Solutions

### **Website Down**
1. Check Vercel deployment status
2. Verify domain configuration (uniko.miguelgarest.com)
3. Redeploy if necessary
4. Use backup domain if available

### **Smart Contract Issues**
1. **Cannot mint**: Check if contract is paused
2. **High gas fees**: Consider pausing temporarily
3. **Wrong phase**: Verify current minting phase
4. **Renderer issues**: Check renderer contract connection

### **High Traffic / Overwhelming Demand**
1. Monitor Alchemy dashboard for rate limits
2. Consider implementing queue system
3. Communicate delays to users
4. Scale RPC plan if needed

## 🛠️ Emergency Commands

### **Pause Minting** (if needed)
```bash
node scripts/admin/pause-unpause.js
```

### **Check Contract Status**
```bash
node scripts/admin/check-status.js
```

### **End Minting Early** (emergency only)
```bash
node scripts/admin/end-minting.js
```

## 📢 Communication Plan

### **Minor Issues**
- Update social media with status
- Post updates in Farcaster

### **Major Issues**
- Immediate social media announcement
- Consider pausing minting until resolved
- Transparent communication about fixes

## 🔍 Monitoring Checklist

**During Launch**:
- [ ] Website loading properly (uniko.miguelgarest.com)
- [ ] Minting function working
- [ ] NFTs displaying correctly
- [ ] Gas costs reasonable
- [ ] No unusual contract activity

**Post-Launch**:
- [ ] All NFTs revealed correctly
- [ ] Metadata loading on OpenSea
- [ ] Secondary sales working (royalties)
- [ ] No security issues reported

## 📱 Emergency Decision Matrix

| Issue Severity | Response Time | Action Required |
|----------------|---------------|-----------------|
| **Critical** (minting broken) | Immediate | Pause & investigate |
| **High** (slow website) | 15 minutes | Scale infrastructure |
| **Medium** (display issues) | 1 hour | Fix without pausing |
| **Low** (minor UX) | Next day | Plan fix for next update |

---

**Remember**: Better to pause and fix than to let broken functionality continue. 