# Backend Fix: Profile Update UserDetails Null Error

## ❌ Vấn đề hiện tại
```
NullPointerException: Cannot invoke "com.group6.Rental_Car.utils.JwtUserDetails.getUserId()" 
because "userDetails" is null
```

Backend đang cố parse `userId` từ SecurityContext nhưng token không được parse đúng, dẫn tới `userDetails` bị null.

## ✅ Giải pháp

### Option 1: Fix Frontend (ĐÃ LÀMRỒI)
Frontend sẽ gửi `userId` trong request body:
```json
{
  "fullName": "...",
  "email": "...",
  "userId": "uuid-string",
  "idCardUrl": "...",
  "driverLicenseUrl": "..."
}
```

### Option 2: Backend cần sửa ProfileController
```java
@PostMapping("/profile/update")
public ResponseEntity<?> updateProfile(
    @RequestBody ProfileUpdateRequest request,
    @AuthenticationPrincipal JwtUserDetails userDetails,  // Có thể null
    HttpServletRequest httpRequest  // Fallback: parse từ header
) {
    // ✅ Handle null case
    UUID userId = null;
    
    // Cách 1: Lấy từ request body (được FE gửi)
    if (request.getUserId() != null) {
        userId = request.getUserId();
        logger.info("✅ Using userId from request body: {}", userId);
    }
    // Cách 2: Lấy từ SecurityContext (nếu userDetails không null)
    else if (userDetails != null) {
        userId = userDetails.getUserId();
        logger.info("✅ Using userId from SecurityContext: {}", userId);
    }
    // Cách 3: Fallback - parse từ Authorization header
    else {
        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            userId = parseUserIdFromToken(token);  // Implement this
            logger.info("✅ Using userId from token header: {}", userId);
        }
    }
    
    if (userId == null) {
        return ResponseEntity.badRequest().body("User ID not found");
    }
    
    // Update profile...
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found"));
    
    // Set fields...
    user.setFullName(request.getFullName());
    user.setEmail(request.getEmail());
    user.setPhone(request.getPhone());
    user.setAddress(request.getAddress());
    // ... etc
    
    userRepository.save(user);
    
    return ResponseEntity.ok("Profile updated");
}
```

### Option 3: Fix JWT Filter để parse token đúng
JWT Filter cần đảm bảo:
```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
        try {
            String token = extractToken(request);
            
            if (token != null) {
                // ✅ Parse JWT đúng cách
                JwtUserDetails userDetails = tokenProvider.getUserDetails(token);
                
                if (userDetails != null) {
                    UsernamePasswordAuthenticationToken auth = 
                        new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities()
                        );
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                    logger.info("✅ JWT token validated for user: {}", userDetails.getEmail());
                } else {
                    logger.warn("⚠️ Could not parse JWT token");
                }
            }
        } catch (Exception e) {
            logger.error("❌ JWT authentication failed:", e);
        }
        
        filterChain.doFilter(request, response);
    }
    
    private String extractToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}
```

## 🔍 Debug Steps

1. **Kiểm tra token có được gửi không:**
   - Open DevTools Console
   - Xem request header có `Authorization: Bearer ...` không

2. **Kiểm tra token có valid không:**
   - Copy token từ console log
   - Decrypt bằng https://jwt.io
   - Xem `userId` có trong payload không

3. **Kiểm tra JWT Filter có run không:**
   - Thêm log vào filter: `logger.info("JWT Filter running...")`
   - Check console backend

## 📝 Frontend đã gửi:
```javascript
// ProfileService.update() giờ sẽ gửi userId trong body
const payload = {
  fullName: "...",
  email: "...",
  userId: user?.id,  // ✅ Thêm vào payload
  idCardUrl: "...",
  driverLicenseUrl: "..."
};
```

---

**Hãy chọn Option 2 hoặc 3 để fix backend nhé!**
