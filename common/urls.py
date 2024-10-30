from django.urls import path
from rest_framework_simplejwt import views as jwt_views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from common.views import UserRegistrationView, UserLoginView

from common import views

app_name = "api_common"


urlpatterns = [
    path("dashboard/", views.ApiHomeView.as_view()),
    path(
        "auth/refresh-token/",
        jwt_views.TokenRefreshView.as_view(),
        name="token_refresh",
    ),
    # ... existing paths
    path("auth/register/", UserRegistrationView.as_view(), name="user-register"),
    path("auth/login/", UserLoginView.as_view(), name="user-login"),
    
    # GoogleLoginView
    path("auth/google/", views.GoogleLoginView.as_view()),
    path("org/", views.OrgProfileCreateView.as_view()),
    path("profile/", views.ProfileView.as_view()),
    path("users/get-teams-and-users/", views.GetTeamsAndUsersView.as_view()),
    path("users/", views.UsersListView.as_view()),
    path("user/<str:pk>/", views.UserDetailView.as_view()),
    path("documents/", views.DocumentListView.as_view()),
    path("documents/<str:pk>/", views.DocumentDetailView.as_view()),
    path("api-settings/", views.DomainList.as_view()),
    path("api-settings/<str:pk>/", views.DomainDetailView.as_view()),
    path("user/<str:pk>/status/", views.UserStatusView.as_view()),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair')
]
