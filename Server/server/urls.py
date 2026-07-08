"""
URL configuration for server project.

The urlpatterns list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path,include
from App import views
from rest_framework.routers import DefaultRouter
from App.views import QuestionViewSet, ClashViewSet, ClashParticipantViewSet, ClashSubmissionViewSet, ClashResultViewSet, ClashHistoryViewSet

router = DefaultRouter()
router.register(r'clashes', ClashViewSet, basename='clash')
router.register(r'clash-participants', ClashParticipantViewSet, basename='clash-participant')
router.register(r'clash-submissions', ClashSubmissionViewSet, basename='clash-submission')
router.register(r'clash-results', ClashResultViewSet, basename='clash-result')
router.register(r'clash-history', ClashHistoryViewSet, basename='clash-history')
router.register(r'', QuestionViewSet)  # Register your viewset

urlpatterns = [
    path('admin/', admin.site.urls),
    path('languages/', views.GetLanguagesView.as_view(), name='get_languages'),  # Updated to class-based view
    path('compile/', views.CompileCodeView.as_view(), name='compile_code'),  # Updated to class-based view
    path('hints/', views.GenerateHintsView.as_view(), name='generate_hints'),  # Updated to class-based view
    path('askAI/', views.AskAIView.as_view(), name='ask_ai'),  # Updated to class-based view
    path('', include(router.urls)),  # Register the Question API endpoint
]